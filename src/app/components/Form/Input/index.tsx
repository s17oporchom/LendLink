import classNames from 'classnames';
import React, { useCallback } from 'react';

import { handleNumber } from 'utils/helpers';

type InputType = 'text' | 'email' | 'password' | 'number';

interface InputProps {
  value: string;
  onChange?: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  appendElem?: React.ReactNode;
  prependElem?: React.ReactNode;
  type?: InputType;
  className?: string;
  inputClassName?: string;
  appendClassName?: string;
  readOnly?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  dataActionId?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  className,
  inputClassName,
  appendElem,
  prependElem,
  appendClassName = 'tw-mr-5',
  dataActionId,
  ...props
}) => {
  const handleChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        if (props.type === 'number') {
          onChange(handleNumber(newValue, true));
        } else {
          onChange(newValue);
        }
      }
    },
    [props.type, onChange],
  );

  return (
    <div
      className={classNames('tw-input-wrapper', className, {
        readonly: props.readOnly,
      })}
    >
      {prependElem && <div className="tw-input-prepend">{prependElem}</div>}
      <input
        className={classNames('tw-input', inputClassName)}
        lang={navigator.language}
        value={value}
        onChange={e => handleChange(e.currentTarget.value)}
        data-action-id={dataActionId}
        {...props}
      />
      {appendElem && (
        <div className={classNames('tw-input-append', appendClassName)}>
          {appendElem}
        </div>
      )}
    </div>
  );
};

Input.defaultProps = {
  inputClassName: 'tw-text-left',
};

interface DummyProps {
  value: React.ReactNode;
  appendElem?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  readOnly?: boolean;
}

export function DummyInput({
  value,
  appendElem,
  className,
  inputClassName,
  ...props
}: DummyProps) {
  return (
    <div
      className={classNames('tw-input-wrapper', className, {
        readonly: props.readOnly,
      })}
    >
      <div
        className={classNames('tw-input tw-truncate tw-pr-0', inputClassName)}
      >
        {value}
      </div>
      {appendElem && (
        <div className="tw-input-append tw-mr-2">{appendElem}</div>
      )}
    </div>
  );
}

DummyInput.defaultProps = {
  inputClassName: 'tw-text-left',
  readOnly: true,
};
