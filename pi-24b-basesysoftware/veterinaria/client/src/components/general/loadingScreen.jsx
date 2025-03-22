import styled, { keyframes } from 'styled-components';

// Define the bounce animation
const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

// Styled component for the loading text
const LoadingText = styled.h1`
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 2px;
`;

// Styled component for each bouncing dot with animation delay
const Dot = styled.span`
  display: inline-block;
  animation: ${bounce} 1s infinite;
  animation-delay: ${({ delay }) => delay};
`;

const Cargando = () => (
  <LoadingText>
    Cargando
    <Dot delay="0s">.</Dot>
    <Dot delay="0.2s">.</Dot>
    <Dot delay="0.4s">.</Dot>
  </LoadingText>
);

export default Cargando;
