import React, { FunctionComponent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LogIn.module.css";

// Arrow Icon component with className prop
const ArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.8159 36.5L7 20L23.8159 3.5L27 6.50779L13.2495 20L27 33.4922L23.8159 36.5Z" fill="#F8F8F8" />
  </svg>
);

// Envisage Logo component
const EnvisageLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="99" height="36" viewBox="0 0 99 36" fill="none" className={styles.envisageLogo}>
    <path d="M50.824 35.9426C49.6661 35.7412 48.6204 35.1181 46.6178 33.4363C45.9488 32.8745 44.7683 31.8405 42.6545 29.9649C36.0444 24.0995 32.6259 21.1604 28.3604 17.675C27.6241 17.0734 27.0283 16.5746 27.0364 16.5666C27.0445 16.5587 27.4955 16.8139 28.0387 17.1339C32.9147 20.0064 38.7717 22.9614 43.7388 25.0551C47.4986 26.6399 50.9747 27.8296 54.3199 28.6765C56.7076 29.281 59.7277 29.8774 62.1343 30.2195C62.9891 30.3411 64.3191 30.4969 64.5017 30.4969C64.5999 30.4969 64.6408 30.5115 64.6305 30.5428C64.5882 30.6715 60.8787 32.5942 58.7692 33.5807C56.1777 34.7927 54.3134 35.5339 53.1865 35.8003C52.3351 36.0015 51.4643 36.054 50.824 35.9426ZM69.4064 27.5349C63.5377 27.1713 57.4223 26.1455 52.6374 24.7221C46.9579 23.0326 38.8988 19.5766 31.5099 15.662C29.7705 14.7405 28.7731 14.2337 26.8763 13.3077C21.3064 10.5887 16.0813 8.38295 11.6507 6.88029C11.2452 6.74276 10.9209 6.62291 10.93 6.61396C10.9851 6.55985 15.2182 7.34116 17.9702 7.91336C20.7272 8.48661 22.8021 8.96839 26.3341 9.85541C43.8606 14.2569 51.5821 15.9111 60.3367 17.1398C65.2258 17.8259 69.5714 18.2445 74.1175 18.4672C75.1924 18.5198 79.8586 18.5319 81.0999 18.4852C81.5472 18.4684 81.9119 18.4684 81.9104 18.4852C81.902 18.5774 78.9206 20.9973 77.1647 22.3372C74.9916 23.9955 72.2644 25.889 70.2619 27.1299C69.5793 27.5528 69.5928 27.5465 69.4064 27.5349ZM74.6223 14.6422C67.7826 14.5046 59.8031 13.6968 52.7496 12.4279C46.9748 11.3891 42.4739 10.3412 30.746 7.30498C25.1156 5.84732 23.9464 5.55046 21.137 4.8653C15.926 3.5944 10.1143 2.27469 0.842964 0.256981C0.308308 0.140626 -0.027035 0.0516282 0.00171266 0.033723C0.119292 -0.0395054 3.09907 0.012462 5.65789 0.132363C10.2911 0.349468 13.3384 0.600223 25.2685 1.74603C35.1475 2.69484 37.256 2.88802 41.6637 3.24819C59.0252 4.66685 73.123 5.13951 83.2778 4.6434C91.0453 4.26391 96.3068 3.27678 98.7476 1.74101C98.8864 1.65368 99 1.59631 99 1.61354C99 1.63076 98.6519 2.02261 98.2263 2.48432C93.9389 7.13632 89.5732 11.5086 87.0542 13.6734C86.8896 13.8147 86.7281 13.9506 86.6952 13.9754C86.6193 14.0325 86.3961 14.0737 85.5583 14.1852C83.6587 14.4381 81.5069 14.5826 78.7164 14.6447C77.0099 14.6826 76.619 14.6824 74.6223 14.6422Z" fill="#A2A2A2"/>
  </svg>
);

const LogIn: FunctionComponent = () => {
  const navigate = useNavigate();
  const patternContainerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    navigate("/meetings");
  };

  // Update the bottomContainer dimensions when the window resizes
  const updateBottomContainerDimensions = () => {
    if (patternContainerRef.current && bottomContainerRef.current) {
      const patternWidth = patternContainerRef.current.offsetWidth;
      
      // Set container width to 60% of pattern container width
      const newWidth = patternWidth * 0.6;
      
      // Only set the width, allow height to flex automatically
      bottomContainerRef.current.style.width = `${newWidth}px`;
      
      // Remove height setting to allow natural sizing
      const brandingImg = bottomContainerRef.current.querySelector(`.${styles.brandingSvg} img`);
      if (brandingImg) {
        // Remove fixed height to allow proper scaling based on width
        (brandingImg as HTMLElement).style.height = 'auto';
      }
      
      console.log(`Pattern width: ${patternWidth}px, Bottom container width: ${newWidth}px`);
    }
  };

  useEffect(() => {
    // Set body styles
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.margin = '0';

    // Initial dimensions calculation
    updateBottomContainerDimensions();

    // Add resize event listener
    window.addEventListener('resize', updateBottomContainerDimensions);

    // Also run on a slight delay to ensure everything is rendered properly
    const timeoutId = setTimeout(updateBottomContainerDimensions, 100);

    return () => {
      // Cleanup styles
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.documentElement.style.margin = '';

      // Remove resize event listener
      window.removeEventListener('resize', updateBottomContainerDimensions);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.patternContainer} ref={patternContainerRef}>
        <img 
          src={`${import.meta.env.BASE_URL}login-pattern.png`} 
          alt="Login pattern" 
          className={styles.patternImage}
        />
        <div className={styles.bottomContainer} ref={bottomContainerRef}>
          <div className={styles.brandingSvg}>
            <img src={`${import.meta.env.BASE_URL}branding.svg`} alt="Branding Logo" style={{ height: '35px', width: 'auto', display: 'block' }} />
          </div>
        </div>
      </div>
      
      <div className={styles.loginFormContainer}>
        <div className={styles.loginBox}>
          {/* Title "Meeting Management" removed */}
          
          {/* Welcome elements */}
          <div className={styles.welcomeContainer}>
            <EnvisageLogo />
            <h2 className={styles.welcomeText}>welcome future</h2>
            <div className={styles.welcomeDivider}></div>
          </div>
          
          <input
            type="email"
            placeholder="email address"
            className={styles.inputField}
          />
          
          <input
            type="password"
            placeholder="password"
            className={styles.inputField}
          />
          
          <button 
            className={styles.loginButton}
            onClick={handleLogin}
          >
            <ArrowIcon className={styles.rotatedIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogIn;