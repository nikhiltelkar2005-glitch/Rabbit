const Card = ({ children, className = '', glass = false, padding = 'md', ...props }) => {
  
  let paddingClass = 'p-4';
  if (padding === 'none') paddingClass = 'p-0';
  if (padding === 'sm') paddingClass = 'p-3';
  if (padding === 'lg') paddingClass = 'p-6';

  return (
    <div 
      className={`${glass ? 'glass-panel' : 'card-solid'} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
