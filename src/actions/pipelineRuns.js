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

import { getPipelineRun, getPipelineRuns, createPipelineRun } from '../api';
import { getSelectedNamespace } from '../reducers';

export function fetchPipelineRunsSuccess(data) {
  return {
    type: 'PIPELINE_RUNS_FETCH_SUCCESS',
    data
  };
}

export function fetchPipelineRun({ name, namespace }) {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINE_RUNS_FETCH_REQUEST' });
    let pipelineRun;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      pipelineRun = await getPipelineRun(name, requestedNamespace);
      dispatch(fetchPipelineRunsSuccess([pipelineRun]));
    } catch (error) {
      dispatch({ type: 'PIPELINE_RUNS_FETCH_FAILURE', error });
    }
    return pipelineRun;
  };
}

export function fetchPipelineRuns({ pipelineName, namespace } = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINE_RUNS_FETCH_REQUEST' });
    let pipelineRuns;
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      pipelineRuns = await getPipelineRuns(requestedNamespace, pipelineName);
      dispatch(fetchPipelineRunsSuccess(pipelineRuns));
    } catch (error) {
      dispatch({ type: 'PIPELINE_RUNS_FETCH_FAILURE', error });
    }
    return pipelineRuns;
  };
}

export function createPipelineRunAction({ payload, namespace }) {
  return async (dispatch, getState) => {
    dispatch({ type: 'PIPELINE_RUNS_FETCH_REQUEST' });
    try {
      const requestedNamespace = namespace || getSelectedNamespace(getState());
      await createPipelineRun(payload, requestedNamespace);
      const pipelineRuns = await getPipelineRuns(
        requestedNamespace,
        payload.pipeline
      );
      dispatch(fetchPipelineRunsSuccess(pipelineRuns));
    } catch (error) {
      dispatch({ type: 'PIPELINE_RUNS_FETCH_FAILURE', error });
    }
  };
}
