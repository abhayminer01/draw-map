const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Login.jsx', 'utf8');

// 1. Add confirmPassword state
content = content.replace(
  /const \[password, setPassword\] = useState\(''\);/,
  `const [password, setPassword] = useState('');\n  const [confirmPassword, setConfirmPassword] = useState('');`
);

// 2. Update handleSubmit
const handleTarget = `    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(\`http://localhost:5000\${endpoint}\`, { email, password });`;

const handleReplace = `    e.preventDefault();
    setError('');
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        return setError('Passwords do not match');
      }
      if (password.length < 8) {
        return setError('Password must be at least 8 characters long');
      }
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        return setError('Invalid email format');
      }
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(\`\${API_URL}\${endpoint}\`, { email, password });`;

content = content.replace(handleTarget, handleReplace);

// 3. Add confirmPassword input
const passwordInputTarget = `              placeholder="••••••••"
            />
          </div>`;

const passwordInputReplace = `              placeholder="••••••••"
            />
          </div>
          
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input 
                type="password" 
                required={!isLogin}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          )}`;
          
content = content.replace(passwordInputTarget, passwordInputReplace);

fs.writeFileSync('client/src/pages/Login.jsx', content);
console.log('Login patch complete.');
