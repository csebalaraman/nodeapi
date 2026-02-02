exports.otpTemplate = (otp, purpose = 'verification') => `
  <div style="font-family: Arial;">
    <h2>${purpose === 'login' ? 'Login OTP' : 'Password Reset OTP'}</h2>
    <p>Your OTP is:</p>
    <h1 style="letter-spacing: 4px;">${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    <br />
    <p>– DisburseX Team</p>
  </div>
`;

exports.resetSuccessTemplate = () => `
  <div>
    <h2>Password Reset Successful</h2>
    <p>Your password has been changed successfully.</p>
  </div>
`;
