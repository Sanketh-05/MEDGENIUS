import React from 'react';

const TOPIC_IMAGES = {
    'myocardial infarction': '/images/heart_mi.png',
    'mi': '/images/heart_mi.png',
    'heart attack': '/images/heart_mi.png',
    'pneumonia': '/images/lungs_pneumonia.png',
    'diabetes mellitus': '/images/diabetes_pancreas.png',
    'diabetes': '/images/diabetes_pancreas.png',
};

/**
 * Check if a topic has a pre-loaded image
 */
export function hasPreloadedImage(topicTitle) {
    const key = topicTitle?.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    return !!TOPIC_IMAGES[key];
}

/**
 * Renders a pre-loaded labeled medical image if available.
 * Returns null if no image found for this topic.
 */
export default function TopicImage({ topicTitle, style }) {
    const key = topicTitle?.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    const imagePath = TOPIC_IMAGES[key] || null;

    if (!imagePath) return null;

    return (
        <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            marginBottom: '20px',
            position: 'relative',
            maxHeight: '300px',
            ...style
        }}>
            <img
                src={imagePath}
                alt={`Medical illustration for ${topicTitle}`}
                style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '300px',
                    objectFit: 'cover',
                    display: 'block',
                    opacity: 0.85,
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '12px 16px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
            }}>
                🖼️ Medical Illustration — {topicTitle}
            </div>
        </div>
    );
}
