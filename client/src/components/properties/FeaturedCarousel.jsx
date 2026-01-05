import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PropertyCard from './PropertyCard';

/**
 * FeaturedCarousel Component
 * Displays a carousel of featured property listings
 * - Shows 3 properties at a time
 * - Auto-scrolls every 5 seconds
 * - Pauses on hover
 * - Manual navigation with arrows
 */
const FeaturedCarousel = ({ properties = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Limit to 6 properties
  const featuredProperties = properties.slice(0, 6);
  const totalSlides = Math.max(1, Math.ceil(featuredProperties.length / 3));
  
  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || featuredProperties.length <= 3) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPaused, totalSlides, featuredProperties.length]);
  
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);
  
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);
  
  // Get visible properties (3 at a time)
  const getVisibleProperties = () => {
    const startIdx = currentIndex * 3;
    return featuredProperties.slice(startIdx, startIdx + 3);
  };
  
  if (featuredProperties.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '2rem' }}>
        No featured properties available.
      </div>
    );
  }
  
  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrow - Left */}
      {featuredProperties.length > 3 && (
        <button
          onClick={goToPrevious}
          style={{
            position: 'absolute',
            left: '-50px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#d4af37',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
            e.currentTarget.style.borderColor = '#d4af37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
          aria-label="Previous properties"
        >
          <FaChevronLeft size={18} />
        </button>
      )}
      
      {/* Carousel Container */}
      <div style={{ overflow: 'hidden', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
            }}
          >
            {getVisibleProperties().map((prop, idx) => (
              <PropertyCard
                key={prop._id || prop.id || idx}
                data={prop}
                index={idx}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation Arrow - Right */}
      {featuredProperties.length > 3 && (
        <button
          onClick={goToNext}
          style={{
            position: 'absolute',
            right: '-50px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#d4af37',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
            e.currentTarget.style.borderColor = '#d4af37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
          aria-label="Next properties"
        >
          <FaChevronRight size={18} />
        </button>
      )}
      
      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
          }}
        >
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentIndex ? '#d4af37' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;
