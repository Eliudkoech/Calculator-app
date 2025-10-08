import React, { useState, useEffect } from 'react';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

function App() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputDigit(parseInt(key));
      } else if (key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key);
      } else if (key === 'Enter' || key === '=') {
        performOperation('=');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === 'Backspace') {
        backspace();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [state]);

  const inputDigit = (digit: number) => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: String(digit),
          waitingForOperand: false,
        };
      } else {
        return {
          ...prevState,
          display: prevState.display === '0' ? String(digit) : prevState.display + digit,
        };
      }
    });
  };

  const inputDecimal = () => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: '0.',
          waitingForOperand: false,
        };
      } else if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.',
        };
      }
      return prevState;
    });
  };

  const clear = () => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
  };

  const backspace = () => {
    setState(prevState => {
      if (prevState.display.length > 1) {
        return {
          ...prevState,
          display: prevState.display.slice(0, -1),
        };
      } else {
        return {
          ...prevState,
          display: '0',
        };
      }
    });
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(state.display);

    setState(prevState => {
      if (prevState.previousValue === null) {
        return {
          ...prevState,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: nextOperation !== '=',
        };
      } else if (prevState.operation && !prevState.waitingForOperand) {
        const currentValue = prevState.previousValue || 0;
        const result = calculate(currentValue, inputValue, prevState.operation);

        if (result === null) {
          return {
            display: 'Error',
            previousValue: null,
            operation: null,
            waitingForOperand: true,
          };
        }

        return {
          display: String(result),
          previousValue: nextOperation === '=' ? null : result,
          operation: nextOperation === '=' ? null : nextOperation,
          waitingForOperand: nextOperation !== '=',
        };
      } else {
        return {
          ...prevState,
          operation: nextOperation,
          waitingForOperand: nextOperation !== '=',
        };
      }
    });
  };

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number | null => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        if (secondOperand === 0) {
          return null; // Division by zero
        }
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  const formatDisplay = (value: string) => {
    if (value === 'Error') return value;
    
    // Handle very large or very small numbers
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
        return num.toExponential(6);
      }
      if (value.includes('.') && value.length > 12) {
        return num.toFixed(8).replace(/\.?0+$/, '');
      }
    }
    
    return value;
  };

  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    'data-testid'?: string;
  }> = ({ onClick, className = '', children, 'data-testid': testId }) => (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`
        h-14 font-semibold text-lg rounded-xl transition-all duration-200 
        active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 
        focus:ring-blue-300 ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Calculator</h1>
          <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        </div>

        {/* Display */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="text-right">
            <div className="text-gray-400 text-sm mb-1 h-5">
              {state.operation && state.previousValue !== null 
                ? `${state.previousValue} ${state.operation === '*' ? '×' : state.operation === '/' ? '÷' : state.operation}`
                : ''
              }
            </div>
            <div 
              className="text-white text-3xl font-mono font-light min-h-[2.5rem] flex items-center justify-end overflow-hidden"
              data-testid="display"
            >
              {formatDisplay(state.display)}
            </div>
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* First Row */}
          <Button
            onClick={clear}
            className="bg-red-500 hover:bg-red-600 text-white col-span-2"
            data-testid="clear"
          >
            Clear
          </Button>
          <Button
            onClick={backspace}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
            data-testid="backspace"
          >
            ⌫
          </Button>
          <Button
            onClick={() => performOperation('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            data-testid="divide"
          >
            ÷
          </Button>

          {/* Second Row */}
          <Button
            onClick={() => inputDigit(7)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="7"
          >
            7
          </Button>
          <Button
            onClick={() => inputDigit(8)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="8"
          >
            8
          </Button>
          <Button
            onClick={() => inputDigit(9)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="9"
          >
            9
          </Button>
          <Button
            onClick={() => performOperation('*')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            data-testid="multiply"
          >
            ×
          </Button>

          {/* Third Row */}
          <Button
            onClick={() => inputDigit(4)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="4"
          >
            4
          </Button>
          <Button
            onClick={() => inputDigit(5)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="5"
          >
            5
          </Button>
          <Button
            onClick={() => inputDigit(6)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="6"
          >
            6
          </Button>
          <Button
            onClick={() => performOperation('-')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            data-testid="subtract"
          >
            −
          </Button>

          {/* Fourth Row */}
          <Button
            onClick={() => inputDigit(1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="1"
          >
            1
          </Button>
          <Button
            onClick={() => inputDigit(2)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="2"
          >
            2
          </Button>
          <Button
            onClick={() => inputDigit(3)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="3"
          >
            3
          </Button>
          <Button
            onClick={() => performOperation('+')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            data-testid="add"
          >
            +
          </Button>

          {/* Fifth Row */}
          <Button
            onClick={() => inputDigit(0)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 col-span-2"
            data-testid="0"
          >
            0
          </Button>
          <Button
            onClick={inputDecimal}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            data-testid="decimal"
          >
            .
          </Button>
          <Button
            onClick={() => performOperation('=')}
            className="bg-green-500 hover:bg-green-600 text-white"
            data-testid="equals"
          >
            =
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-xs">
          Use keyboard for input • Press ESC to clear
        </div>
      </div>
    </div>
  );
}

export default App;