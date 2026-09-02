import { useNavigate } from 'react-router-dom';

function Navbar({ user }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  }

  return (
    <header className="navbar">
      <div>
        <h1>Tasker</h1>

        <span>
          Olá, {user?.name}!
        </span>
      </div>

      <button onClick={handleLogout}>
        Sair
      </button>
    </header>
  );
}

export default Navbar;