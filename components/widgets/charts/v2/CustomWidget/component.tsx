import WidgetHeader from 'components/widgets/header/component';
import WidgetInfo from 'components/widgets/info';
import WidgetShareModal from 'components/widgets/share-modal/component';
import React, { Attributes, useState } from 'react';
import styles from './styles.module.scss';

interface CustomWidgetProps {
  country,
  widget: React.FunctionComponent;
  controlsProps: any;
  title: string;
  info: any;
}

const CustomWidget = ({ country, widget, controlsProps, title, info }: CustomWidgetProps) => {
  const widgetHeader = {
    id: null,
    name: title,
    type: undefined,
  };

  const [config, setConfig] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [params, setParams] = useState({});

  const toggleShowInfo = () => setShowInfo((s) => !s);
  const toggleShareModal = () => setShowShareModal((s) => !s);

  return (
    <div className="p-4 border border-b-0 rounded border-gray-light shadow-gray-light shadow-sm h-full">
      <WidgetHeader
        widget={widgetHeader}
        onToggleInfo={toggleShowInfo}
        onToggleShare={toggleShareModal}
      />
      {typeof window !== 'undefined' && (
        <div
          className={`${styles.c_param_chart} relative flex overflow-y-hidden widget-container grow mb-3 pt-6`}
        >
          {React.createElement(widget, {
            config,
            setConfig,
            setParams,
            controlsProps,
          } as Attributes)}
          {showInfo && widget && <WidgetInfo widget={info} className="p-4" />}
        </div>
      )}
      {showShareModal && (
        <WidgetShareModal
          isVisible={showShareModal}
          widget={info}
          onClose={toggleShareModal}
          country={undefined}
          params={{ geostore: country.value, ...params }}
          worldview={undefined}
        />
      )}
    </div>
  );
};

export default CustomWidget;
