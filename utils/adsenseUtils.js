// AdSense utility functions for better ad management and error handling

class AdSenseManager {
  constructor() {
    this.initialized = false;
    this.blocked = false;
    this.testMode = false;
    this.publisher_id = 'ca-pub-3543327769912677';
    this.callbacks = [];
    
    // Check if we're in test mode
    this.testMode =
      this.publisher_id.includes('XXXXXXXXXX') ||
      (typeof window !== 'undefined' && Boolean(window.adsenseTestMode));
  }

  // Initialize AdSense
  async initialize() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { success: false, blocked: true, error: new Error('AdSense unavailable during SSR'), testMode: false };
    }

    if (this.initialized) {
      return { success: true, blocked: this.blocked, testMode: this.testMode };
    }

    try {
      // If in test mode, immediately set as blocked to show fallback
      if (this.testMode) {
        this.blocked = true;
        this.initialized = true;
        console.info('AdSense: Test mode active - showing fallback content');
        
        this.callbacks.forEach(callback => callback({ 
          success: true, 
          blocked: true, 
          testMode: true 
        }));
        
        return { success: true, blocked: true, testMode: true };
      }

      // Check if AdSense was already marked as blocked by the HTML script
      if (window.adsenseBlocked) {
        this.blocked = true;
        this.initialized = true;
        
        this.callbacks.forEach(callback => callback({ 
          success: true, 
          blocked: true 
        }));
        
        return { success: true, blocked: true };
      }

      // Check if AdSense script is loaded
      if (!window.adsbygoogle && !window.adsenseLoaded) {
        await this.loadAdSenseScript();
      }

      // Test if AdSense is working
      const testResult = await this.testAdSense();
      this.blocked = !testResult;
      this.initialized = true;

      // Notify all callbacks
      this.callbacks.forEach(callback => callback({ 
        success: true, 
        blocked: this.blocked,
        testMode: this.testMode
      }));

      return { success: true, blocked: this.blocked, testMode: this.testMode };
    } catch (error) {
      console.info('AdSense: Initialization failed - showing fallback content');
      this.blocked = true;
      this.initialized = true;
      
      this.callbacks.forEach(callback => callback({ 
        success: false, 
        blocked: true, 
        error,
        testMode: this.testMode
      }));
      
      return { success: false, blocked: true, error, testMode: this.testMode };
    }
  }

  // Load AdSense script dynamically
  loadAdSenseScript() {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="adsbygoogle.js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisher_id}`;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load AdSense script - likely blocked by ad blocker'));
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('AdSense script loading timeout'));
      }, 5000);

      document.head.appendChild(script);
    });
  }

  // Test if AdSense is working
  testAdSense() {
    return new Promise((resolve) => {
      try {
        if (!window.adsbygoogle) {
          resolve(false);
          return;
        }

        // Simple test - try to access adsbygoogle properties
        const test = window.adsbygoogle.loaded !== undefined || 
                   Array.isArray(window.adsbygoogle);
        resolve(test);
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Push ad to queue
  pushAd(element) {
    if (this.blocked || !window.adsbygoogle) {
      return false;
    }

    try {
      window.adsbygoogle.push({});
      return true;
    } catch (error) {
      console.warn('Failed to push ad:', error);
      return false;
    }
  }

  // Add callback for initialization
  onInitialized(callback) {
    if (this.initialized) {
      callback({ success: true, blocked: this.blocked });
    } else {
      this.callbacks.push(callback);
    }
  }

  // Check if ads are blocked
  isBlocked() {
    return this.blocked;
  }

  // Get initialization status
  isInitialized() {
    return this.initialized;
  }
}

// Create global instance
export const adSenseManager = new AdSenseManager();

// Utility function to detect ad blockers
export const detectAdBlocker = () => {
  return new Promise((resolve) => {
    // Create a test element that ad blockers typically hide
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    // Check if element is hidden after a delay
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0 || 
                       window.getComputedStyle(testAd).display === 'none';
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

// Ad slot configurations for different placements
export const AdSlots = {
  BANNER_TOP: '1234567890',
  RECTANGLE_SIDEBAR: '1234567891', 
  BANNER_BOTTOM: '1234567892',
  MOBILE_BANNER: '1234567893',
  IN_ARTICLE: '1234567894'
};

// Initialize AdSense on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    adSenseManager.initialize();
  });
}

export default adSenseManager;
