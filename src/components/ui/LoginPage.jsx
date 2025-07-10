// src/components/ui/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
      navigate('/Dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorMsg(error.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10">
        <CardContent className="p-8">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">G</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">GSkills</h1>
            <p className="text-white/70">Aprendizado personalizado para sua carreira</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && <p className="text-red-400 text-center">{errorMsg}</p>}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
            >
              {isLoading ? 'Entrando...' : 'Sign In'}
            </Button>

            {/* Opções extras */}
            <div className="text-center mt-4 space-y-2">
              <button
                type="button"
                onClick={goToSignup}
                className="text-white/90 hover:text-white text-sm"
              >
                Não tem uma conta? <span className="underline">Cadastre-se</span>
              </button>

              <div>
                <a href="#" className="text-white/70 hover:text-white text-sm">
                  Forgot password?
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
