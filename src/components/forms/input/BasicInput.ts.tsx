import * as React from "react";

import { chakra, Input } from "@chakra-ui/react";

type Props = {
    placeholder: string;

    // eslint-disable-next-line no-unused-vars
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

    isErrored?: boolean;
    errorMessage?: string;
}

const BasicInputStyled = chakra('div', {
    baseStyle: {
        width: '100%',

        input: {
            marginBottom: '0.5rem',
        }
    }
});

const ErrorStyled = chakra('span', {
    baseStyle: {
        color: '#E53E3E',
        fontSize: '0.7rem',
    }
});

export default function BasicInput({ placeholder, onChange, isErrored = false, errorMessage = '' }: Props) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event);
    }

    return (
        <BasicInputStyled>
            <Input isInvalid={isErrored} placeholder={placeholder} onChange={handleChange} />
            {isErrored && errorMessage && <ErrorStyled>{errorMessage}</ErrorStyled>}
        </BasicInputStyled>
    )
}