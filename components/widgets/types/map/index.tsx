import { useMemo, useCallback, useState, CSSProperties } from 'react';
import { useQueries } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';

// services
import { fetchLayer } from 'services/layer';

// hooks
import { useFetchWidget } from 'hooks/widget';
// import useBelongsToCollection from 'hooks/collection/belongs-to-collection';
import { useGeostore } from 'hooks/geostore';
// import { useMe } from 'hooks/user';

// utils
import { getAoiLayer, getMaskLayer, getLayerGroups } from 'utils/layers';

// components
import ErrorFallback from 'components/error-fallback';
import MapTypeWidget from './component';

import type { APILayerSpec } from 'types/layer';
import type { APIWidgetSpec } from 'types/widget';

const CustomErrorFallback = (_props: any) => (
  <ErrorFallback {..._props} title="Something went wrong loading the widget" />
);

export interface MapTypeWidgetContainerProps {
  widgetId: string;
  params?: Record<string, string | number | unknown>;
  style?: CSSProperties;
  isEmbed?: boolean;
  isWebshot?: boolean;
  areaOfInterest?: string | null;
  onToggleShare: (widget: APIWidgetSpec) => void;
  onToggleEnlarge?: (widget: APIWidgetSpec) => void;
  isEnlarged?: boolean;
}

const MapTypeWidgetContainer = ({
  widgetId,
  params = {},
  style = {},
  isEmbed = false,
  isWebshot = false,
  areaOfInterest = null,
  onToggleShare,
  onToggleEnlarge,
  isEnlarged = false,
}: MapTypeWidgetContainerProps): JSX.Element => {
  const [minZoom, setMinZoom] = useState(null);
  const isInACollection = false;

  const {
    data: widget,
    isFetching,
    isError: isErrorWidget,
    refetch: refetchWidget,
  } = useFetchWidget(
    widgetId,
    {
      includes: 'metadata',
    },
    {
      enabled: !!widgetId,
      refetchOnWindowFocus: false,
      placeholderData: {},
    }
  );

  const {
    data: geostore,
    isError: isErrorGeostore,
    refetch: refetchGeostore,
  } = useGeostore(
    areaOfInterest,
    {},
    {
      enabled: !!areaOfInterest,
      refetchOnWindowFocus: false,
    }
  );

  const layerIds = useMemo(() => {
    if (widget?.widgetConfig?.paramsConfig?.layers)
      return widget.widgetConfig.paramsConfig.layers;
    if (widget?.widgetConfig?.paramsConfig?.layer)
      return [widget.widgetConfig.paramsConfig.layer];
    return [];
  }, [widget]);

  const layerStates = useQueries(
    layerIds.map((layerId) => ({
      queryKey: ['fetch-layer', layerId],
      queryFn: () => fetchLayer(layerId),
      placeholderData: null,
      select: (_layer: APILayerSpec) =>
        _layer
          ? {
              ..._layer,
              params,
            }
          : null,
    }))
  );

  const layers: APILayerSpec[] = useMemo(
    () =>
      layerStates
        .filter(({ data }) => !!data && data['id'])
        .map(({ data }) => data) as APILayerSpec[],
    [layerStates]
  );

  const onFitBoundsChange = useCallback((viewport) => {
    const { zoom } = viewport;

    setMinZoom(zoom);
  }, []);

  const aoiLayer = useMemo(
    () => getAoiLayer(widget, geostore, { minZoom }),
    [geostore, widget, minZoom]
  );

  const bounds = useMemo(() => {
    if (geostore?.bbox)
      return {
        bbox: geostore.bbox,
        options: {
          padding: 50,
        },
      };

    if (!widget?.widgetConfig?.bounds) return null;

    return {
      bbox: widget.widgetConfig.bbox,
    };
  }, [widget, geostore]);

  const maskLayer = useMemo(
    () => getMaskLayer(widget, params),
    [widget, params]
  );

  const layerGroups = useMemo(() => {
    const { layerParams } = widget?.widgetConfig?.paramsConfig || {};
    return getLayerGroups(layers, layerParams, true);
  }, [layers, widget]);

  const isError = useMemo(
    () => isErrorWidget || isErrorGeostore,
    [isErrorWidget, isErrorGeostore]
  );

  return (
    <ErrorBoundary
      FallbackComponent={CustomErrorFallback}
      onReset={() => {
        refetchWidget();
        if (areaOfInterest) refetchGeostore();
      }}
    >
      <MapTypeWidget
        layerGroups={layerGroups}
        bounds={bounds}
        aoiLayer={aoiLayer}
        maskLayer={maskLayer}
        widget={widget}
        style={style}
        isEmbed={isEmbed}
        isWebshot={isWebshot}
        isFetching={isFetching}
        isError={isError}
        isInACollection={isInACollection}
        onToggleShare={onToggleShare}
        onToggleEnlarge={onToggleEnlarge}
        onFitBoundsChange={onFitBoundsChange}
        isEnlarged={isEnlarged}
      />
    </ErrorBoundary>
  );
};

export default MapTypeWidgetContainer;
