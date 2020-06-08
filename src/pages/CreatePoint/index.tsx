import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import api from '../../services/api';
import Logo from '../../assets/logo.svg'

import './styles.css';
import Axios from 'axios';
// import { Container } from './styles';

interface Items {
  title: string;
  id: number;
  image_url: string;
}

interface IBGEresposne {
  sigla: string;
}

interface IBGEcityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {

  const [items, setItems] = useState<Items[]>([]);
  const [uf, setUF] = useState<string[]>([]);
  const [citys, setCitys] = useState<string[]>([]);

  const [ufSelecionada, setUfSelecionada] = useState<string>('0');
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('0');

  const [posicao, setPosicao] = useState<[number, number]>([0, 0]);
  const [posicaoInicial, setPosicaoInicial] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selectedItens, setSelectedItens] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() => {
    loadInitialPosition();
    loadDataAPI();
    loadEstados();

  }, []);

  function loadInitialPosition() {
    navigator.geolocation.getCurrentPosition(posicao => {
      const { latitude, longitude } = posicao.coords;
      setPosicaoInicial([latitude, longitude]);
      console.log(latitude, longitude);
    })
  }

  async function loadDataAPI() {
    const response = await api.get('/itens');
    setItems(response.data);
  };
  // https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/distritos
  async function loadEstados() {
    const response = await Axios.get<IBGEresposne[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const ufInitials = response.data.map((uf: any) => uf.sigla);
    setUF(ufInitials);

  }

  useEffect(() => {
    loadCitys();
  }, [ufSelecionada]);

  async function loadCitys() {
    if (ufSelecionada !== '0'){
      const response = await Axios.get<IBGEcityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/distritos`);

      const cityNames = response.data.map(city => city.nome);

      setCitys(cityNames);
    }
  }

  function handleMapClick(evento:LeafletMouseEvent) {
    setPosicao([evento.latlng.lat, evento.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target;
    
    setFormData({...formData, [name]: value});
  };

  function handleSelectItem(data: number) {
    const jaSelecionado = selectedItens.findIndex(item => item === data);

    if (jaSelecionado >= 0) {
      const filteredItens = selectedItens.filter(item => item !== data);

      setSelectedItens(filteredItens);
    } else {
      setSelectedItens([...selectedItens, data]);
    }

  }

  async function submit(evento: FormEvent) {
    evento.preventDefault();

    const { name, email, whatsapp } = formData;

    const uf = ufSelecionada;
    const cidade = cidadeSelecionada;

    const [latitude, longitude] = posicao;

    const items = selectedItens;


    const data = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city: cidade,
      uf,
      itens: items
    };

    await api.post('/points', data);
    history.push('/');
    alert('ponto de coleta criado!');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="logo-ecoleta"/>
        <Link to="/">
          Voltar para home
          <span>
            <FiArrowLeft />
          </span>
        </Link>
      </header>
      <form onSubmit={submit}>
        <h1> Cadastro do <br/> ponto de coleta </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name" 
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
              
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
                type="email"
                name="email" 
                id="email"
                onChange={handleInputChange}

              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp" 
                id="whatsapp"
                onChange={handleInputChange}

              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend> 
          {/* https://www.google.com/maps/@,,15z */}
          <Map center={posicaoInicial} zoom={15} Onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={posicao} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                onChange={(data) => setUfSelecionada(data.target.value)}
                name="uf"
                id="uf"
                value={ufSelecionada}
                >
                  <option value="0">selecine uma uf</option>
                    {uf.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                value={cidadeSelecionada}
                onChange={(data) => setCidadeSelecionada(data.target.value)}
                name="city"
                id="city">
                  <option value='0'>selecine uma cidade</option>
                  {citys.map(cidade => (
                    <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens a baixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItens.includes(item.id) ? 'selected': ''}
                >
                  <img src={item.image_url} alt="teste"/>
                  <span>{ item.title }</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">
          cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;