const nodemailer = require('nodemailer');

// ============================================
// CONFIGURAZIONE SMTP CON POOL
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // ✅ OTTIMIZZAZIONI
  pool: true,               // ✅ Usa connection pooling
  maxConnections: 5,        // ✅ Max 5 connessioni simultanee
  maxMessages: 100,         // ✅ Max 100 email per connessione
  rateDelta: 1000,          // ✅ Rate limit: 1 secondo
  rateLimit: 5,             // ✅ Max 5 email/secondo
});

// ✅ CIRCUIT BREAKER per email
let emailCircuitOpen = false;
let emailFailureCount = 0;
const MAX_FAILURES = 3;
const CIRCUIT_RESET_TIME = 60000; // 1 minuto

const resetCircuit = () => {
  emailCircuitOpen = false;
  emailFailureCount = 0;
};

// Test connessione
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
    emailCircuitOpen = true;
    setTimeout(resetCircuit, CIRCUIT_RESET_TIME);
  } else {
    console.log('✅ SMTP server ready to send emails');
    resetCircuit();
  }
});

// ✅ TEMPLATE HTML BASE (cached)
const emailTemplateCache = new Map();

const getEmailTemplate = (content) => {
  const cacheKey = 'base_template';
  
  if (emailTemplateCache.has(cacheKey)) {
    return emailTemplateCache.get(cacheKey).replace('{{CONTENT}}', content);
  }

  const template = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ValiryArt</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #1a1a1a; color: #ffffff; }
    .email-container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #2C1810 0%, #1A0D08 100%); border: 1px solid rgba(250, 233, 199, 0.2); }
    .header { background: linear-gradient(135deg, #3A2817 0%, #2C1810 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #FAE9C7; }
    .logo-text { font-size: 48px; font-weight: bold; color: #FAE9C7; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .tagline { font-size: 12px; color: rgba(250, 233, 199, 0.7); letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #FAE9C7; margin-top: 0; font-size: 24px; }
    .content p { line-height: 1.6; color: #FAE9C7; margin: 15px 0; }
    .info-box { background: rgba(26, 77, 2, 0.2); border-left: 4px solid #1A4D02; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-box strong { color: #FAE9C7; }
    .button { display: inline-block; padding: 15px 30px; background-color: #7E4622; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    .footer { background: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; border-top: 1px solid rgba(250, 233, 199, 0.1); font-size: 12px; color: rgba(250, 233, 199, 0.8); }
    .footer a { color: #FAE9C7; text-decoration: none; }
    .divider { height: 1px; background: rgba(250, 233, 199, 0.2); margin: 20px 0; }
    .status-badge { display: inline-block; padding: 5px 15px; background: rgba(26, 77, 2, 0.3); border: 1px solid #1A4D02; border-radius: 20px; color: #FAE9C7; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="logo-text">ValiryArt</h1>
      <p class="tagline">Creazioni Artigianali</p>
    </div>
    <div class="content">
      {{CONTENT}}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ValiryArt - Tutti i diritti riservati</p>
      <p><a href="https://wa.me/393123456789">WhatsApp</a> | <a href="https://instagram.com/valiryart">Instagram</a> | <a href="mailto:valiryart93@gmail.com">Email</a></p>
      <p style="font-size: 10px; margin-top: 15px;">Hai ricevuto questa email perché hai inviato una richiesta su ValiryArt.<br>Se non riconosci questa richiesta, ignora questa email.</p>
    </div>
  </div>
</body>
</html>`;

  emailTemplateCache.set(cacheKey, template);
  return template.replace('{{CONTENT}}', content);
};

// ============================================
// UTILITY: SAFE SEND EMAIL
// ============================================
const safeSendEmail = async (mailOptions) => {
  // ✅ Circuit breaker check
  if (emailCircuitOpen) {
    console.warn('⚠️  Email circuit breaker OPEN - skipping email');
    return { success: false, error: 'Circuit breaker open' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // ✅ Reset failure count su successo
    emailFailureCount = 0;
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // ✅ Incrementa failure count
    emailFailureCount++;
    
    if (emailFailureCount >= MAX_FAILURES) {
      console.error(`❌ Email circuit breaker OPENED after ${MAX_FAILURES} failures`);
      emailCircuitOpen = true;
      setTimeout(resetCircuit, CIRCUIT_RESET_TIME);
    }
    
    return { success: false, error: error.message };
  }
};

// ============================================
// TEMPLATE GENERATORS (ottimizzati)
// ============================================
const categoriaLabels = {
  incisioni: '🪵 Incisioni su Legno',
  torte: '🎂 Torte Decorative',
  eventi: '🎉 Allestimento Eventi',
  altro: '💡 Richiesta Personalizzata'
};

const statusLabels = {
  nuova: '🆕 Nuova',
  in_valutazione: '🔍 In Valutazione',
  preventivo_inviato: '💰 Preventivo Inviato',
  accettata: '✅ Accettata',
  in_lavorazione: '🔨 In Lavorazione',
  completata: '🎉 Completata',
  rifiutata: '❌ Rifiutata',
  annullata: '🚫 Annullata'
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// EMAIL FUNCTIONS
// ============================================

// 1. Conferma richiesta al cliente
const sendConfirmationEmail = async (requestData) => {
  const content = `
    <h2>✅ Richiesta Ricevuta con Successo!</h2>
    <p>Ciao <strong>${requestData.nome_contatto}</strong>,</p>
    <p>Grazie per aver scelto ValiryArt! Ho ricevuto la tua richiesta e la prenderò in carico al più presto.</p>
    
    <div class="info-box">
      <strong>📋 Riepilogo Richiesta</strong><br>
      <strong>Categoria:</strong> ${categoriaLabels[requestData.categoria]}<br>
      <strong>ID Richiesta:</strong> #${requestData.id.substring(0, 8).toUpperCase()}<br>
      <strong>Data:</strong> ${formatDate(requestData.created_at)}
    </div>

    <p><strong>Descrizione:</strong><br>${requestData.descrizione}</p>

    <div class="divider"></div>

    <h3>🔍 Cosa Succede Ora?</h3>
    <p>1️⃣ Valuto attentamente la tua richiesta<br>2️⃣ Ti contatto per discutere i dettagli<br>3️⃣ Ti invio un preventivo personalizzato<br>4️⃣ Una volta confermato, inizio la realizzazione!</p>

    <p>Ti risponderò entro <strong>24-48 ore</strong>. Se hai fretta o domande, non esitare a contattarmi direttamente su WhatsApp!</p>

    <div style="text-align: center;">
      <a href="https://wa.me/393123456789" class="button">💬 Contattami su WhatsApp</a>
    </div>

    <p style="margin-top: 30px;">A presto,<br><strong style="color: #FAE9C7;">Valeria</strong><br><em style="font-size: 14px; color: rgba(255,255,255,0.7);">ValiryArt - Creazioni Artigianali</em></p>
  `;

  return safeSendEmail({
    from: `"ValiryArt" <${process.env.SMTP_USER}>`,
    to: requestData.email_contatto,
    subject: `✅ Richiesta Ricevuta - ValiryArt #${requestData.id.substring(0, 8).toUpperCase()}`,
    html: getEmailTemplate(content),
  });
};

// 2. Notifica nuova richiesta a Valeria
const sendNewRequestAdminEmail = async (requestData, userData = null) => {
  const content = `
    <h2>🔔 Nuova Richiesta Ricevuta!</h2>
    
    <div class="info-box">
      <strong>📋 Dettagli Richiesta</strong><br>
      <strong>ID:</strong> #${requestData.id.substring(0, 8).toUpperCase()}<br>
      <strong>Categoria:</strong> ${categoriaLabels[requestData.categoria]}<br>
      <strong>Data:</strong> ${formatDate(requestData.created_at)}<br>
      <strong>Cliente:</strong> ${requestData.nome_contatto}<br>
      <strong>Email:</strong> ${requestData.email_contatto}<br>
      ${requestData.telefono_contatto ? `<strong>Telefono:</strong> ${requestData.telefono_contatto}<br>` : ''}
      ${userData ? `<strong>Utente Registrato:</strong> Sì ✅` : `<strong>Utente Guest</strong> 👤`}
    </div>

    <h3>📝 Descrizione</h3>
    <p>${requestData.descrizione}</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:8081/admin/requests/${requestData.id}" class="button">🔍 Visualizza Richiesta</a>
    </div>

    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.7);">Ricordati di rispondere al cliente entro 24-48 ore! 😊</p>
  `;

  return safeSendEmail({
    from: `"ValiryArt System" <${process.env.SMTP_USER}>`,
    to: 'valiryart93@gmail.com',
    subject: `🔔 Nuova Richiesta #${requestData.id.substring(0, 8).toUpperCase()} - ${requestData.categoria}`,
    html: getEmailTemplate(content),
  });
};

// 3. Notifica cambio stato
const sendStatusChangeEmail = async (requestData, oldStatus, newStatus) => {
  const statusMessages = {
    in_valutazione: 'Ho preso in carico la tua richiesta e sto valutando tutti i dettagli per creare qualcosa di speciale!',
    preventivo_inviato: 'Ti ho inviato un preventivo dettagliato. Controlla i messaggi nella tua area personale!',
    accettata: 'Perfetto! Ho ricevuto la tua conferma. Iniziamo a dare vita alla tua idea!',
    in_lavorazione: 'Sto lavorando al tuo progetto con dedizione. Presto sarà pronto!',
    completata: 'Il tuo progetto è completato! Spero che ti piaccia quanto a me è piaciuto realizzarlo! 🎨',
    rifiutata: 'Purtroppo non posso procedere con questa richiesta. Controlla i messaggi per maggiori dettagli.',
    annullata: 'La richiesta è stata annullata come da tua richiesta.'
  };

  const content = `
    <h2>🔔 Aggiornamento Richiesta</h2>
    <p>Ciao <strong>${requestData.nome_contatto}</strong>,</p>
    <p>La tua richiesta <strong>#${requestData.id.substring(0, 8).toUpperCase()}</strong> ha cambiato stato:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span class="status-badge" style="background: rgba(139, 69, 19, 0.3);">${statusLabels[oldStatus]}</span>
      <span style="font-size: 24px; margin: 0 15px;">→</span>
      <span class="status-badge">${statusLabels[newStatus]}</span>
    </div>

    <div class="info-box">
      <strong>💬 Messaggio di Valeria:</strong><br>
      ${statusMessages[newStatus]}
    </div>

    ${requestData.preventivo_importo && newStatus === 'preventivo_inviato' ? `
    <div class="info-box" style="background: rgba(250, 233, 199, 0.1);">
      <strong>💰 Preventivo:</strong> €${parseFloat(requestData.preventivo_importo).toFixed(2)}<br>
      ${requestData.preventivo_note ? `<strong>Note:</strong> ${requestData.preventivo_note}` : ''}
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:8081/user/requests/${requestData.id}" class="button">📋 Visualizza Dettagli</a>
    </div>

    <p style="margin-top: 30px;">Hai domande? Rispondimi direttamente nell'area personale o contattami su WhatsApp!</p>
    <p style="margin-top: 20px;">Con affetto,<br><strong style="color: #FAE9C7;">Valeria</strong></p>
  `;

  return safeSendEmail({
    from: `"ValiryArt" <${process.env.SMTP_USER}>`,
    to: requestData.email_contatto,
    subject: `🔔 Aggiornamento Richiesta #${requestData.id.substring(0, 8).toUpperCase()}`,
    html: getEmailTemplate(content),
  });
};

// 4. Notifica nuovo messaggio
const sendNewMessageEmail = async (requestData, senderName, messageText, isForAdmin) => {
  const content = `
    <h2>💬 Nuovo Messaggio Ricevuto</h2>
    <p>${isForAdmin ? 'Ciao Valeria,' : `Ciao ${requestData.nome_contatto},`}</p>
    <p>${isForAdmin ? 'Il cliente' : 'Valeria'} ha inviato un nuovo messaggio sulla richiesta <strong>#${requestData.id.substring(0, 8).toUpperCase()}</strong>:</p>
    
    <div class="info-box">
      <strong>Da:</strong> ${senderName}<br>
      <strong>Data:</strong> ${formatDate(new Date())}<br><br>
      <strong>Messaggio:</strong><br>
      <p style="margin-top: 10px;">${messageText}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:8081/${isForAdmin ? 'admin' : 'user'}/requests/${requestData.id}" class="button">💬 Rispondi</a>
    </div>

    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.7);">
      ${isForAdmin ? 'Ricordati di rispondere tempestivamente!' : 'Puoi rispondere dalla tua area personale.'}
    </p>
  `;

  return safeSendEmail({
    from: `"ValiryArt" <${process.env.SMTP_USER}>`,
    to: isForAdmin ? 'valiryart93@gmail.com' : requestData.email_contatto,
    subject: `💬 Nuovo Messaggio - Richiesta #${requestData.id.substring(0, 8).toUpperCase()}`,
    html: getEmailTemplate(content),
  });
};

// ✅ GRACEFUL SHUTDOWN
const closeTransporter = () => {
  return new Promise((resolve) => {
    transporter.close(() => {
      console.log('✅ Email transporter closed');
      resolve();
    });
  });
};

module.exports = {
  sendConfirmationEmail,
  sendNewRequestAdminEmail,
  sendStatusChangeEmail,
  sendNewMessageEmail,
  transporter,
  closeTransporter
};