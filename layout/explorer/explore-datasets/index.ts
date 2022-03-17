import { connect } from 'react-redux';
import * as actions from 'layout/explore/actions';

// selectors
import { getUpdatedDatasets, getSelectedTagsWithData } from './selectors';

import ExploreDatasetsComponent from './component';

export default connect(
    (state) => ({
      // Store
      datasets: state.explore.datasets,
      list: getUpdatedDatasets(state),
      ...state.explore.filters,
      selectedTags: getSelectedTagsWithData(state),
      loading: state.explore.datasets.loading,
    }),
    actions,
 )(ExploreDatasetsComponent);
