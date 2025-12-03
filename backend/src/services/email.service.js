const nodemailer = require('nodemailer');

// ============================================
// CONFIGURAZIONE SMTP
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test connessione
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server ready to send emails');
  }
});

// ============================================
// TEMPLATE HTML BASE
// ============================================
const getEmailTemplate = (content) => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ValiryArt</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #1a1a1a;
      color: #ffffff;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #2C1810 0%, #1A0D08 100%);
      border: 1px solid rgba(250, 233, 199, 0.2);
    }
    .header {
      background: linear-gradient(135deg, #3A2817 0%, #2C1810 100%);
      padding: 30px 20px;
      text-align: center;
      border-bottom: 2px solid #FAE9C7;
    }
    .logo-text {
      font-size: 48px;
      font-weight: bold;
      color: #FAE9C7;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    .tagline {
      font-size: 12px;
      color: rgba(250, 233, 199, 0.7);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #FAE9C7;
      margin-top: 0;
      font-size: 24px;
    }
    .content p {
      line-height: 1.6;
      color: #FAE9C7;
      margin: 15px 0;
    }
    .info-box {
      background: rgba(26, 77, 2, 0.2);
      border-left: 4px solid #1A4D02;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info-box strong {
      color: #FAE9C7;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background-color: #7E4622;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .button:hover {
      background-color: #6a3a1c;
    }
    .footer {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      text-align: center;
      border-top: 1px solid rgba(250, 233, 199, 0.1);
      font-size: 12px;
      color: rgba(250, 233, 199, 0.8);
    }
    .footer a {
      color: #FAE9C7;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: rgba(250, 233, 199, 0.2);
      margin: 20px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      background: rgba(26, 77, 2, 0.3);
      border: 1px solid #1A4D02;
      border-radius: 20px;
      color: #FAE9C7;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="logo-text">ValiryArt</h1>
      <p class="tagline">Creazioni Artigianali</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ValiryArt - Tutti i diritti riservati</p>
      <p>
        <a href="https://wa.me/393123456789">WhatsApp</a> | 
        <a href="https://instagram.com/valiryart">Instagram</a> | 
        <a href="mailto:valiryart93@gmail.com">Email</a>
      </p>
      <p style="font-size: 10px; margin-top: 15px;">
        Hai ricevuto questa email perché hai inviato una richiesta su ValiryArt.<br>
        Se non riconosci questa richiesta, ignora questa email.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ============================================
// TEMPLATE: CONFERMA RICHIESTA (Cliente)
// ============================================
const getConfirmRequestTemplate = (requestData) => {
  const categoriaLabels = {
    incisioni: '🪵 Incisioni su Legno',
    torte: '🎂 Torte Decorative',
    eventi: '🎉 Allestimento Eventi',
    altro: '💡 Richiesta Personalizzata'
  };

  return getEmailTemplate(`
    <h2>✅ Richiesta Ricevuta con Successo!</h2>
    <p>Ciao <strong>${requestData.nome_contatto}</strong>,</p>
    <p>Grazie per aver scelto ValiryArt! Ho ricevuto la tua richiesta e la prenderò in carico al più presto.</p>
    
    <div class="info-box">
      <strong>📋 Riepilogo Richiesta</strong><br>
      <strong>Categoria:</strong> ${categoriaLabels[requestData.categoria]}<br>
      <strong>ID Richiesta:</strong> #${requestData.id.substring(0, 8).toUpperCase()}<br>
      <strong>Data:</strong> ${new Date(requestData.created_at).toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </div>

    <p><strong>Descrizione:</strong><br>${requestData.descrizione}</p>

    <div class="divider"></div>

    <h3>🔍 Cosa Succede Ora?</h3>
    <p>
      1️⃣ Valuto attentamente la tua richiesta<br>
      2️⃣ Ti contatto per discutere i dettagli<br>
      3️⃣ Ti invio un preventivo personalizzato<br>
      4️⃣ Una volta confermato, inizio la realizzazione!
    </p>

    <p>Ti risponderò entro <strong>24-48 ore</strong>. Se hai fretta o domande, non esitare a contattarmi direttamente su WhatsApp!</p>

    <div style="text-align: center;">
      <a href="https://wa.me/393123456789" class="button">💬 Contattami su WhatsApp</a>
    </div>

    <p style="margin-top: 30px;">
      A presto,<br>
      <strong style="color: #FAE9C7;">Valeria</strong><br>
      <em style="font-size: 14px; color: rgba(255,255,255,0.7);">ValiryArt - Creazioni Artigianali</em>
    </p>
  `);
};

// ============================================
// TEMPLATE: NUOVA RICHIESTA (Admin/Valeria)
// ============================================
const getNewRequestAdminTemplate = (requestData, userData) => {
  const categoriaLabels = {
    incisioni: '🪵 Incisioni su Legno',
    torte: '🎂 Torte Decorative',
    eventi: '🎉 Allestimento Eventi',
    altro: '💡 Richiesta Personalizzata'
  };

  return getEmailTemplate(`
    <h2>🔔 Nuova Richiesta Ricevuta!</h2>
    
    <div class="info-box">
      <strong>📋 Dettagli Richiesta</strong><br>
      <strong>ID:</strong> #${requestData.id.substring(0, 8).toUpperCase()}<br>
      <strong>Categoria:</strong> ${categoriaLabels[requestData.categoria]}<br>
      <strong>Data:</strong> ${new Date(requestData.created_at).toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}<br>
      <strong>Cliente:</strong> ${requestData.nome_contatto}<br>
      <strong>Email:</strong> ${requestData.email_contatto}<br>
      ${requestData.telefono_contatto ? `<strong>Telefono:</strong> ${requestData.telefono_contatto}<br>` : ''}
      ${userData ? `<strong>Utente Registrato:</strong> Sì ✅` : `<strong>Utente Guest</strong> 👤`}
    </div>

    <h3>📝 Descrizione</h3>
    <p>${requestData.descrizione}</p>

    ${requestData.dati_specifici ? `
    <h3>🔧 Dettagli Tecnici</h3>
    <div class="info-box">
      <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${JSON.stringify(requestData.dati_specifici, null, 2)}</pre>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:8081/admin/requests/${requestData.id}" class="button">🔍 Visualizza Richiesta Completa</a>
    </div>

    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.7);">
      Ricordati di rispondere al cliente entro 24-48 ore per mantenere un servizio eccellente! 😊
    </p>
  `);
};

// ============================================
// TEMPLATE: CAMBIO STATO RICHIESTA (Cliente)
// ============================================
const getStatusChangeTemplate = (requestData, oldStatus, newStatus) => {
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

  const statusMessages = {
    in_valutazione: 'Ho preso in carico la tua richiesta e sto valutando tutti i dettagli per creare qualcosa di speciale!',
    preventivo_inviato: 'Ti ho inviato un preventivo dettagliato. Controlla i messaggi nella tua area personale!',
    accettata: 'Perfetto! Ho ricevuto la tua conferma. Iniziamo a dare vita alla tua idea!',
    in_lavorazione: 'Sto lavorando al tuo progetto con dedizione. Presto sarà pronto!',
    completata: 'Il tuo progetto è completato! Spero che ti piaccia quanto a me è piaciuto realizzarlo! 🎨',
    rifiutata: 'Purtroppo non posso procedere con questa richiesta. Controlla i messaggi per maggiori dettagli.',
    annullata: 'La richiesta è stata annullata come da tua richiesta.'
  };

  return getEmailTemplate(`
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
      <a href="http://localhost:8081/user/requests/${requestData.id}" class="button">📋 Visualizza Dettagli Completi</a>
    </div>

    <p style="margin-top: 30px;">
      Hai domande? Rispondimi direttamente nell'area personale o contattami su WhatsApp!
    </p>

    <p style="margin-top: 20px;">
      Con affetto,<br>
      <strong style="color: #FAE9C7;">Valeria</strong>
    </p>
  `);
};

// ============================================
// TEMPLATE: NUOVO MESSAGGIO (Notifica)
// ============================================
const getNewMessageTemplate = (requestData, senderName, messageText, isForAdmin) => {
  return getEmailTemplate(`
    <h2>💬 Nuovo Messaggio Ricevuto</h2>
    <p>${isForAdmin ? 'Ciao Valeria,' : `Ciao ${requestData.nome_contatto},`}</p>
    <p>${isForAdmin ? 'Il cliente' : 'Valeria'} ha inviato un nuovo messaggio sulla richiesta <strong>#${requestData.id.substring(0, 8).toUpperCase()}</strong>:</p>
    
    <div class="info-box">
      <strong>Da:</strong> ${senderName}<br>
      <strong>Data:</strong> ${new Date().toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}<br><br>
      <strong>Messaggio:</strong><br>
      <p style="margin-top: 10px;">${messageText}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="http://localhost:8081/${isForAdmin ? 'admin' : 'user'}/requests/${requestData.id}" class="button">💬 Rispondi al Messaggio</a>
    </div>

    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.7);">
      ${isForAdmin ? 'Ricordati di rispondere tempestivamente per mantenere una comunicazione efficace!' : 'Puoi rispondere direttamente dalla tua area personale.'}
    </p>
  `);
};

// ============================================
// FUNZIONI DI INVIO EMAIL
// ============================================

// Conferma richiesta al cliente
const sendConfirmationEmail = async (requestData) => {
  try {
    const mailOptions = {
      from: `"ValiryArt" <${process.env.SMTP_USER}>`,
      to: requestData.email_contatto,
      subject: `✅ Richiesta Ricevuta - ValiryArt #${requestData.id.substring(0, 8).toUpperCase()}`,
      html: getConfirmRequestTemplate(requestData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Notifica nuova richiesta a Valeria
const sendNewRequestAdminEmail = async (requestData, userData = null) => {
  try {
    const mailOptions = {
      from: `"ValiryArt System" <${process.env.SMTP_USER}>`,
      to: 'valiryart93@gmail.com', // Email Valeria
      subject: `🔔 Nuova Richiesta #${requestData.id.substring(0, 8).toUpperCase()} - ${requestData.categoria}`,
      html: getNewRequestAdminTemplate(requestData, userData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
    return { success: false, error: error.message };
  }
};

// Notifica cambio stato
const sendStatusChangeEmail = async (requestData, oldStatus, newStatus) => {
  try {
    const mailOptions = {
      from: `"ValiryArt" <${process.env.SMTP_USER}>`,
      to: requestData.email_contatto,
      subject: `🔔 Aggiornamento Richiesta #${requestData.id.substring(0, 8).toUpperCase()}`,
      html: getStatusChangeTemplate(requestData, oldStatus, newStatus),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Status change email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending status change email:', error);
    return { success: false, error: error.message };
  }
};

// Notifica nuovo messaggio
const sendNewMessageEmail = async (requestData, senderName, messageText, isForAdmin) => {
  try {
    const mailOptions = {
      from: `"ValiryArt" <${process.env.SMTP_USER}>`,
      to: isForAdmin ? 'valiryart93@gmail.com' : requestData.email_contatto,
      subject: `💬 Nuovo Messaggio - Richiesta #${requestData.id.substring(0, 8).toUpperCase()}`,
      html: getNewMessageTemplate(requestData, senderName, messageText, isForAdmin),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ New message email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending message email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendConfirmationEmail,
  sendNewRequestAdminEmail,
  sendStatusChangeEmail,
  sendNewMessageEmail,
  transporter
};