// TextMaskCustom.tsx
import React from "react";
import MaskedInput from "react-text-mask";

interface TextMaskCustomProps {
  mask: (string | RegExp)[];
  placeholderChar?: string;
  guide?: boolean;
  inputRef?: (ref: HTMLInputElement | null) => void;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
  function TextMaskCustom(props, ref) {
    const { mask, placeholderChar, guide, ...other } = props;

    return (
      <MaskedInput
        {...other}
        mask={mask}
        placeholderChar={placeholderChar || "\u2000"}
        guide={guide}
        ref={(maskedInputRef: any) => {
          // MUI ref → haqiqiy input elementga
          if (typeof ref === "function") {
            ref(maskedInputRef ? maskedInputRef.inputElement : null);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current =
              maskedInputRef ? maskedInputRef.inputElement : null;
          }
        }}
      />
    );
  }
);

export default TextMaskCustom;
