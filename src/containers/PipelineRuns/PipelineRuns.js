/*
Copyright 2019 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  InlineNotification,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper,
  Button
} from 'carbon-components-react';
import Add from '@carbon/icons-react/lib/add/16';

import { getStatusIcon, getStatus } from '../../utils';
import { fetchPipelineRuns } from '../../actions/pipelineRuns';

import {
  getPipelineRuns,
  getPipelineRunsByPipelineName,
  getPipelineRunsErrorMessage,
  getSelectedNamespace,
  isFetchingPipelineRuns
} from '../../reducers';
import { CreatePipelineRun } from '..';

export /* istanbul ignore next */ class PipelineRuns extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreatePipelineRunModal: false
    };

    this.showCreatePipelineRunModal = this.showCreatePipelineRunModal.bind(
      this
    );
    this.hideCreatePipelineRunModal = this.hideCreatePipelineRunModal.bind(
      this
    );
  }

  componentDidMount() {
    this.fetchPipelineRuns();
  }

  componentDidUpdate(prevProps) {
    const { match, namespace } = this.props;
    const { pipelineName } = match.params;
    const { match: prevMatch, namespace: prevNamespace } = prevProps;
    const { pipelineName: prevPipelineName } = prevMatch.params;

    if (namespace !== prevNamespace || pipelineName !== prevPipelineName) {
      this.fetchPipelineRuns();
    }
  }

  fetchPipelineRuns() {
    const { params } = this.props.match;
    const { pipelineName } = params;
    this.props.fetchPipelineRuns({ pipelineName });
  }

  showCreatePipelineRunModal() {
    this.setState({
      showCreatePipelineRunModal: true
    });
  }

  hideCreatePipelineRunModal() {
    this.setState({
      showCreatePipelineRunModal: false
    });
  }

  render() {
    const { match, error, loading, pipelineRuns } = this.props;
    const { pipelineName } = match.params;

    return (
      <>
        <Button
          iconDescription="Button icon"
          renderIcon={Add}
          onClick={this.showCreatePipelineRunModal}
          // style={{ float: 'right' }}
        >
          Create PipelineRun
        </Button>
        <CreatePipelineRun
          open={this.state.showCreatePipelineRunModal}
          onRequestClose={this.hideCreatePipelineRunModal}
          pipelineName={pipelineName}
        />
        {(() => {
          if (loading) {
            return <StructuredListSkeleton border />;
          }

          if (error) {
            return (
              <InlineNotification
                kind="error"
                title="Error loading pipeline runs"
                subtitle={JSON.stringify(error)}
              />
            );
          }

          return (
            <StructuredListWrapper border selection>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Pipeline Run</StructuredListCell>
                  {!pipelineName && (
                    <StructuredListCell head>Pipeline</StructuredListCell>
                  )}
                  <StructuredListCell head>Status</StructuredListCell>
                  <StructuredListCell head>
                    Last Transition Time
                  </StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {!pipelineRuns.length && (
                  <StructuredListRow>
                    <StructuredListCell>
                      {pipelineName ? (
                        <span>No pipeline runs for {pipelineName}</span>
                      ) : (
                        <span>No pipeline runs</span>
                      )}
                    </StructuredListCell>
                  </StructuredListRow>
                )}
                {pipelineRuns.map(pipelineRun => {
                  const pipelineRunName = pipelineRun.metadata.name;
                  const pipelineRefName = pipelineRun.spec.pipelineRef.name;
                  const { lastTransitionTime, reason, status } = getStatus(
                    pipelineRun
                  );

                  return (
                    <StructuredListRow
                      className="definition"
                      key={pipelineRun.metadata.uid}
                    >
                      <StructuredListCell>
                        <Link
                          to={`/pipelines/${pipelineRefName}/runs/${pipelineRunName}`}
                        >
                          {pipelineRunName}
                        </Link>
                      </StructuredListCell>
                      {!pipelineName && (
                        <StructuredListCell>
                          <Link to={`/pipelines/${pipelineRefName}`}>
                            {pipelineRefName}
                          </Link>
                        </StructuredListCell>
                      )}
                      <StructuredListCell
                        className="status"
                        data-reason={reason}
                        data-status={status}
                      >
                        {getStatusIcon({ reason, status })}
                        {pipelineRun.status.conditions
                          ? pipelineRun.status.conditions[0].message
                          : ''}
                      </StructuredListCell>
                      <StructuredListCell>
                        {lastTransitionTime}
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })}
              </StructuredListBody>
            </StructuredListWrapper>
          );
        })()}
      </>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const { pipelineName } = props.match.params;
  return {
    error: getPipelineRunsErrorMessage(state),
    loading: isFetchingPipelineRuns(state),
    namespace: getSelectedNamespace(state),
    pipelineRuns: pipelineName
      ? getPipelineRunsByPipelineName(state, {
          name: pipelineName
        })
      : getPipelineRuns(state)
  };
}

const mapDispatchToProps = {
  fetchPipelineRuns
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelineRuns);
