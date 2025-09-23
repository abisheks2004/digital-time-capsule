const sendEmail = require("./sendEmail");

const sendCapsuleEmail = async (recipientEmail, capsuleTitle, unlockDate, shareLink, attachments = []) => {
  const subject = `📦 You've received a Digital Time Capsule: ${capsuleTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4a90e2;">You've been sent a Digital Time Capsule!</h2>
      <p><strong>Title:</strong> ${capsuleTitle}</p>
      <p><strong>Unlock Date:</strong> ${unlockDate}</p>
      <p>Click below to view your capsule once it’s unlocked:</p>
      <a href="${shareLink}" target="_blank" 
         style="display: inline-block; padding: 10px 20px; background: #4a90e2; color: #fff; text-decoration: none; border-radius: 5px;">
        Open Capsule
      </a>
      <p style="margin-top: 20px;">⏳ Enjoy your time capsule!</p>
    </div>
  `;
  const text = `You've been sent a Digital Time Capsule!\nTitle: ${capsuleTitle}\nUnlock Date: ${unlockDate}\nLink: ${shareLink}`;

  await sendEmail(recipientEmail, subject, text, html, attachments);
};

module.exports = sendCapsuleEmail;
