import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import { Asset } from 'types/asset';
import { translations } from 'locales/i18n';
import { AssetsDictionary } from 'utils/dictionaries/assets-dictionary';
import { fromWei } from 'utils/blockchain/math-helpers';
import { weiToAssetNumberFormat } from 'utils/display-text/format';
import { useAssetBalanceOf } from 'app/hooks/useAssetBalanceOf';
import { LoadableValue } from '../LoadableValue';
import { AssetRenderer } from '../AssetRenderer';
import styles from './index.module.scss';

interface IAvailableBalanceProps {
  asset: Asset;
  className?: string;
  dataActionId?: string;
}

export const AvailableBalance: React.FC<IAvailableBalanceProps> = ({
  asset,
  className,
  dataActionId,
}) => {
  const { value, loading } = useAssetBalanceOf(asset);
  const assetDetails = useMemo(() => AssetsDictionary.get(asset), [asset]);
  return (
    <div
      className={classNames(styles.balance, className)}
      data-action-id={dataActionId}
    >
      <Trans
        i18nKey={translations.marginTradePage.tradeForm.labels.balance}
        components={[
          <LoadableValue
            value={
              <span
                data-action-id={dataActionId}
                className="tw-font-semibold tw-ml-1"
              >
                {weiToAssetNumberFormat(value, assetDetails.asset)}{' '}
                <AssetRenderer asset={assetDetails.asset} />
              </span>
            }
            loading={loading}
            tooltip={
              <div className="tw-font-semibold">
                {fromWei(value)} <AssetRenderer asset={assetDetails.asset} />
              </div>
            }
          />,
        ]}
      />
    </div>
  );
};
