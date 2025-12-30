import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Heading,
  Spinner,
  Card,
} from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";
import { messageService, authService } from "../services/api";
import Sidebar from "../components/common/Sidebar";

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = authService.getCurrentUser();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messageService.getMessages(userId);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      setSendingMessage(true);
      await messageService.send({
        receiverId: selectedUserId,
        content: newMessage.trim(),
      });
      setNewMessage("");
      // Reload messages to show the new one
      await loadMessages(selectedUserId);
      // Reload conversations to update last message
      await loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.partner._id === selectedUserId
  );

  if (loading) {
    return (
      <Flex minH="100vh" bg="#0a0a0f">
        <Sidebar />
        <Flex justify="center" align="center" flex={1}>
          <Spinner size="xl" color="yellow.500" />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="#0a0a0f">
      <Sidebar />
      <Box flex={1} p={6}>
        <Heading mb={6} color="yellow.400">
          Messages
        </Heading>

      <Flex
        gap={4}
        h="calc(100vh - 200px)"
        minH="500px"
      >
        {/* Conversations Sidebar */}
        <Card.Root
          w="350px"
          flexShrink={0}
          bg="gray.800"
          borderColor="gray.700"
          overflow="hidden"
        >
          <Card.Header bg="gray.900" py={3}>
            <Heading textAlign="center" size="sm" color="white">
              Conversations
            </Heading>
          </Card.Header>
          <Card.Body p={0} overflow="auto">
            <VStack align="stretch" gap={0}>
              {conversations.length === 0 ? (
                <Text p={4} color="gray.400" textAlign="center">
                  No conversations yet
                </Text>
              ) : (
                conversations.map((conv) => (
                  <Box
                    key={conv.partner._id}
                    p={4}
                    cursor="pointer"
                    bg={
                      selectedUserId === conv.partner._id
                        ? "yellow.900"
                        : "transparent"
                    }
                    _hover={{ bg: "gray.700" }}
                    borderBottom="1px solid"
                    borderColor="gray.700"
                    onClick={() => setSelectedUserId(conv.partner._id)}
                  >
                    <HStack gap={3}>
                      <Avatar.Root size="md">
                        <Avatar.Image src={conv.partner.image} />
                        <Avatar.Fallback>
                          {conv.partner.name?.charAt(0)}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Box flex={1} minW={0}>
                        <Text fontWeight="bold" color="white" truncate>
                          {conv.partner.name}
                        </Text>
                        <Text fontSize="sm" color="gray.400" truncate>
                          {conv.lastMessage?.content}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Chat Area */}
        <Card.Root flex={1} bg="gray.800" borderColor="gray.700" overflow="hidden">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <Card.Header bg="gray.900" py={4} px={6}>
                <HStack gap={4}>
                  <Avatar.Root size="md">
                    <Avatar.Image src={selectedConversation?.partner?.image} />
                    <Avatar.Fallback>
                      {selectedConversation?.partner?.name?.charAt(0) || "?"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {selectedConversation?.partner?.name || "User"}
                  </Text>
                </HStack>
              </Card.Header>

              {/* Messages */}
              <Card.Body
                flex={1}
                overflow="auto"
                p={4}
                display="flex"
                flexDirection="column"
                gap={3}
              >
                {messages.length === 0 ? (
                  <Flex justify="center" align="center" flex={1}>
                    <Text color="gray.400">
                      No messages yet. Start the conversation!
                    </Text>
                  </Flex>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage =
                      msg.sender._id === currentUser?._id ||
                      msg.sender._id === currentUser?.id;
                    return (
                      <Flex
                        key={msg._id}
                        justify={isOwnMessage ? "flex-end" : "flex-start"}
                      >
                        <Box
                          maxW="70%"
                          bg={isOwnMessage ? "yellow.600" : "gray.700"}
                          color="white"
                          px={4}
                          py={2}
                          borderRadius="lg"
                          borderBottomRightRadius={isOwnMessage ? 0 : "lg"}
                          borderBottomLeftRadius={isOwnMessage ? "lg" : 0}
                        >
                          <Text>{msg.content}</Text>
                          <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Card.Body>

              {/* Message Input */}
              <Card.Footer bg="gray.900" p={4} px={6}>
                <HStack w="100%" gap={4}>
                  <Input
                    flex={1}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    px={4}
                    py={3}
                    _placeholder={{ color: "gray.400" }}
                    _focus={{ borderColor: "yellow.500" }}
                  />
                  <Button
                    colorScheme="yellow"
                    onClick={handleSendMessage}
                    loading={sendingMessage}
                    disabled={!newMessage.trim()}
                  >
                    <FiSend />
                  </Button>
                </HStack>
              </Card.Footer>
            </>
          ) : (
            <Flex justify="center" align="center" flex={1}>
              <Text color="gray.400">
                Select a conversation or start a new one
              </Text>
            </Flex>
          )}
        </Card.Root>
      </Flex>
      </Box>
    </Flex>
  );
};

export default MessagesPage;
