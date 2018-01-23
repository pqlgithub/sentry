import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import {t} from '../../../locale';
import ApiMixin from '../../../mixins/apiMixin';
import AsyncView from '../../asyncView';
import Confirm from '../../../components/confirm';
import IndicatorStore from '../../../stores/indicatorStore';
import SettingsPageHeader from '../components/settingsPageHeader';

const TeamRow = createReactClass({
  displayName: 'TeamRow',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired,
    access: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: false,
      error: false,
    };
  },

  handleRemove() {
    if (this.state.loading) return;

    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
    let {orgId, projectId, team} = this.props;
    this.api.request(`/projects/${orgId}/${projectId}/teams/${team.slug}/`, {
      method: 'DELETE',
      success: (d, _, jqXHR) => {
        this.props.onRemove();
        IndicatorStore.remove(loadingIndicator);
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
        IndicatorStore.remove(loadingIndicator);
      },
    });
  },

  render() {
    let team = this.props.team;
    return (
      <tr>
        <td>
          <h5 style={{marginBottom: 5}}>{team.name}</h5>
        </td>
        {this.props.access.has('project:write') && (
          <td style={{textAlign: 'right'}}>
            <Confirm
              message={t('Are you sure you want to remove this team?')}
              onConfirm={this.handleRemove}
              disabled={this.state.loading}
            >
              <a className="btn btn-sm btn-default">
                <span className="icon icon-trash" /> &nbsp;{t('Remove')}
              </a>
            </Confirm>
          </td>
        )}
      </tr>
    );
  },
});

class ProjectTeams extends AsyncView {
  getEndpoints() {
    let {orgId, projectId} = this.props.params;
    return [['teams', `/projects/${orgId}/${projectId}/teams/`]];
  }

  handleRemovedTeam(removedTeam) {
    this.setState({
      teams: this.state.teams.filter(team => {
        return team.slug !== removedTeam.slug;
      }),
    });
  }

  renderEmpty() {
    return (
      <div className="box empty-stream">
        <span className="icon icon-exclamation" />
        <p>{t('There are no teams with access to this project.')}</p>
      </div>
    );
  }

  renderResults() {
    let {orgId, projectId} = this.props.params;
    let access = new Set(this.props.organization.access);
    return (
      <div className="panel panel-default horizontal-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>{t('Team')}</th>
              {access.has('project:write') && <th style={{width: 120}} />}
            </tr>
          </thead>
          <tbody>
            {this.state.teams.map(team => {
              return (
                <TeamRow
                  access={access}
                  key={team.id}
                  orgId={orgId}
                  projectId={projectId}
                  team={team}
                  onRemove={this.handleRemovedTeam.bind(this, team)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderBody() {
    let body;

    if (this.state.teams.length > 0) body = this.renderResults();
    else body = this.renderEmpty();

    return (
      <div>
        <SettingsPageHeader title={t('Teams')} />
        {body}
      </div>
    );
  }
}

export default ProjectTeams;
