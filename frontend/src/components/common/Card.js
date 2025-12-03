import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title = null,
  subtitle = null,
  image = null,
  imageAlt = '',
  footer = null,
  hoverable = true,
  clickable = false,
  onClick = null,
  className = '',
  ...props 
}) => {
  const cardClasses = [
    'valiryart-card',
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses} 
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {image && (
        <div className="card-image-container">
          <img src={image} alt={imageAlt} className="card-image" loading="lazy" />
        </div>
      )}
      
      <div className="card-content">
        {(title || subtitle) && (
          <div className="card-header">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        )}
        
        <div className="card-body">
          {children}
        </div>
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;