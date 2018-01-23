import React from 'react';
import {shallow} from 'enzyme';

import {Client} from 'app/api';
import ProjectTeams from 'app/views/settings/project/projectTeams';

describe('ProjectTeamsSettings', function() {
  let org;
  let project;
  let team;

  beforeEach(function() {
    org = TestStubs.Organization();
    project = TestStubs.Project();
    team = TestStubs.Team();

    Client.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/`,
      method: 'GET',
      body: project,
    });
    Client.addMockResponse({
      url: `/projects/${org.slug}/${project.slug}/teams/`,
      method: 'GET',
      body: [team],
    });
  });

  describe('render()', function() {
    it('renders', function() {
      let wrapper = shallow(
        <ProjectTeams
          params={{orgId: org.slug, projectId: project.slug}}
          organization={org}
        />,
        {
          context: {
            router: TestStubs.router(),
          },
        }
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
