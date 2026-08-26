import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApi() {
      try {
        const response = await fetch('http://localhost:3001');

        if (!response.ok) {
          throw new Error('Erro ao conectar com a API');
        }

        const data = await response.json();

        setMessage(data.message);
      } catch (error) {
        setMessage('Não foi possível conectar com a API.');
      } finally {
        setLoading(false);
      }
    }

    fetchApi();
  }, []);

  return (
    <main>
      <h1>TaskFlow</h1>
      <p>Gerenciador de tarefas</p>

      <section>
        <h2>Status da API</h2>

        {loading ? (
          <p>Conectando...</p>
        ) : (
          <p>{message}</p>
        )}
      </section>
    </main>
  );
}

export default App;