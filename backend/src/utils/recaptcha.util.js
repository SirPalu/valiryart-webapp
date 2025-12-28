// backend/src/utils/recaptcha.util.js

const axios = require('axios');

/**
 * Verifica il token reCAPTCHA con l'API di Google
 * @param {string} token - Token reCAPTCHA dal frontend
 * @param {string} remoteIp - IP del client (opzionale)
 * @returns {Promise<{success: boolean, score?: number, errorCodes?: string[]}>}
 */
const verifyRecaptcha = async (token, remoteIp = null) => {
  try {
    if (!token) {
      return {
        success: false,
        errorCodes: ['missing-token']
      };
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('❌ RECAPTCHA_SECRET_KEY non configurata!');
      return {
        success: false,
        errorCodes: ['server-config-error']
      };
    }

    // Chiamata API Google reCAPTCHA
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
          ...(remoteIp && { remoteip: remoteIp })
        }
      }
    );

    const { success, score, 'error-codes': errorCodes } = response.data;

    if (!success) {
      console.warn('⚠️  reCAPTCHA verification failed:', errorCodes);
      return {
        success: false,
        errorCodes: errorCodes || ['verification-failed']
      };
    }

    console.log('✅ reCAPTCHA verified successfully', score ? `(score: ${score})` : '');
    
    return {
      success: true,
      score: score || null
    };

  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error.message);
    return {
      success: false,
      errorCodes: ['network-error']
    };
  }
};

/**
 * Middleware Express per verificare reCAPTCHA
 */
const recaptchaMiddleware = async (req, res, next) => {
  const token = req.body.recaptchaToken;
  const clientIp = req.ip || req.connection.remoteAddress;

  const result = await verifyRecaptcha(token, clientIp);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Verifica reCAPTCHA fallita. Sei un robot? 🤖',
      errorCodes: result.errorCodes
    });
  }

  // reCAPTCHA verificato con successo
  req.recaptchaVerified = true;
  next();
};

module.exports = {
  verifyRecaptcha,
  recaptchaMiddleware
};