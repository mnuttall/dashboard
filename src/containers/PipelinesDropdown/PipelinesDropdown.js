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

import React from 'react';
import { connect } from 'react-redux';
import { Dropdown, DropdownSkeleton } from 'carbon-components-react';

import {
  getPipelines,
  isFetchingPipelines,
  getSelectedNamespace
} from '../../reducers';
import { fetchPipelines } from '../../actions/pipelines';

const itemToElement = ({ text }) => {
  return (
    <div key={text} title={text}>
      {text}
    </div>
  );
};

const itemToString = ({ text }) => text;

const itemStringToObject = text => ({ text });

class PipelinesDropdown extends React.Component {
  componentDidMount() {
    this.props.fetchPipelines();
  }

  componentDidUpdate(prevProps) {
    const { namespace } = this.props;
    if (namespace !== prevProps.namespace) {
      this.props.fetchPipelines();
    }
  }

  render() {
    const { items, loading, ...dropdownProps } = this.props;

    if (loading) {
      return <DropdownSkeleton {...dropdownProps} />;
    }
    const options = items.map(itemStringToObject);
    return (
      <Dropdown
        {...dropdownProps}
        itemToElement={itemToElement}
        items={options}
        itemToString={itemToString}
      />
    );
  }
}

PipelinesDropdown.defaultProps = {
  items: [],
  loading: true,
  label: 'Select Pipeline'
};

function mapStateToProps(state) {
  return {
    items: getPipelines(state).map(sa => sa.metadata.name),
    loading: isFetchingPipelines(state),
    namespace: getSelectedNamespace(state)
  };
}

const mapDispatchToProps = {
  fetchPipelines
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PipelinesDropdown);