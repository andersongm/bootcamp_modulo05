import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Form, SubmitButton, List, Message } from './styles';

import Container from '../../components/Container';

import api from '../../services/api';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
    messageError: '',
    filter: {
      state: ['All', 'Open', 'Closed'],
    },
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    const { filter } = this.state;

    console.log(filter);

    if (repositories) {
      this.setState({
        repositories: JSON.parse(repositories),
      });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({
      newRepo: e.target.value,
      messageError: !e.target.value,
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      this.setState({ loading: true, error: false, messageError: '' });

      const { newRepo, repositories } = this.state;

      const repo = repositories.find(r => r.name === newRepo);

      if (repo) {
        this.setState({
          messageError: 'Repositorio Duplicado',
        });
        return;
      }

      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (err) {
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = repo => {
    const { repositories } = this.state;

    this.setState({
      repositories: repositories.filter(r => r.name !== repo),
    });

    localStorage.setItem('repositories', JSON.stringify(repositories));
  };

  render() {
    const { newRepo, repositories, loading, error, messageError } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Message>{messageError}</Message>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar Repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0} repo={!newRepo}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <div>
                <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                  Detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => this.handleDelete(repository.name)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
