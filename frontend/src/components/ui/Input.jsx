import './Input.css';

const Input = ({ 
  label, 
  error, 
  id, 
  icon: Icon,
  fullWidth = true,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`input-group ${fullWidth ? 'input-full' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" size={18} />}
        <input 
          id={id} 
          className={`input-field ${Icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`} 
          {...props} 
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
