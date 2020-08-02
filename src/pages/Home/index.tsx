import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import './styles.css';

import Logo from '../../assets/logo.svg'

const Home: React.FC = () => {
  return (
    <div id="page-home">
        <div className="content">
            <header>
                <img src={Logo} alt="logo-ecoleta"/>
            </header>

            <main>
                <h1>Seu marketplace de coleta de resíduos</h1>
                <p>Ajudamos pessoas a econtratem pontos de coleta de forma eficiente</p>
                <Link to="/create-point">
                    <span>
                        <FiLogIn />
                    </span>
                    <strong>
                        cadastre um ponto de coleta
                    </strong>
                </Link>
            </main>
        </div>
    </div>
  )
}

export default Home;