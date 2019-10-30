import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaRegCaretSquareRight, FaRegCaretSquareLeft } from 'react-icons/fa';
import api from '../../services/api';

import { Loading, Owner, IssueList, Select } from './styles';

import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: [
      { label: 'Todas', state: 'all' },
      { label: 'Abertas', state: 'open' },
      { label: 'Fechadas', state: 'closed' },
    ],
    stateActual: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { page, stateActual } = this.state;
    this.loadIssues(stateActual, page);
  }

  loadIssues = async (state, page) => {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 30,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      stateActual: state,
      page,
    });
  };

  handleChangeState = e => {
    const state = e.target.value;
    const { page } = this.state;

    this.setState({
      stateActual: state,
    });

    this.loadIssues(state, page);
  };

  nextPage = e => {
    const { stateActual, page } = this.state;
    const p = page + 1;

    this.loadIssues(stateActual, p);
  };

  prevPage = e => {
    const { stateActual, page } = this.state;
    const p = page - 1;

    if (p === 0) {
      this.setState({
        page: p,
      });
      return;
    }

    this.loadIssues(stateActual, p);
  };

  render() {
    const { repository, issues, loading, filter, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <div className="selectControl">
            <Select onChange={this.handleChangeState}>
              {filter.map(f => (
                <option key={f.state} value={f.state}>
                  {f.label}
                </option>
              ))}
            </Select>
            <div>
              <button
                type="button"
                onClick={this.prevPage}
                disabled={page === 1}
              >
                <FaRegCaretSquareLeft />
              </button>
              <button type="button" onClick={this.nextPage}>
                <FaRegCaretSquareRight />
              </button>
            </div>
          </div>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
