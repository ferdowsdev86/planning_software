import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface DemoYesNoEditorProps {
    value?: boolean;
}

export interface DemoEditorRef {
    getValue: () => boolean;
    setValue: (value: boolean) => Promise<boolean>;
    isValid: () => boolean;
    focus: () => void;
}

const DemoYesNoEditor = forwardRef<DemoEditorRef, DemoYesNoEditorProps>((props, ref) => {
    const [value, setValue] = useState<boolean>(props.value ?? false);

    const yesButton = useRef<HTMLButtonElement>(null);
    const noButton  = useRef<HTMLButtonElement>(null);

    // Expose imperative methods to parent using ref
    useImperativeHandle(ref, () => ({
        getValue : () => value,
        setValue : async newValue => {
            setValue(newValue);
            return newValue;
        },
        isValid : () => true,
        focus   : () => {
            if (value) {
                noButton.current?.focus();
            }
            else {
                yesButton.current?.focus();
            }
        }
    }));

    return (
        <>
            <button
                className="yes-button"
                tabIndex={-1}
                ref={yesButton}
                style={{ background : value ? '#d5f5e3' : '#f2f3f4' }}
                onClick={() => setValue(true)}
            >
                Yes
            </button>
            <button
                className="no-button"
                tabIndex={-1}
                ref={noButton}
                style={{ background : value ? '#f2f3f4' : '#f5b7b1' }}
                onClick={() => setValue(false)}
            >
                No
            </button>
        </>
    );
});

export default DemoYesNoEditor;
