const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
      <div className="loading-container">
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <p>{message}</p>
      </div>
    );
  };
  
  export default LoadingSpinner;