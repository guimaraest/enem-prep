import './PrimaryButton.css'

interface PrimaryButtonProps {
    text: string;
    onPress: () => void;
}

export function PrimaryButton({
    text,
    onPress,
}: PrimaryButtonProps) {
    return (
        <button
            className="primary-button hover"
            onClick={() => onPress()}
        >
            {text}
        </button>
    );
}