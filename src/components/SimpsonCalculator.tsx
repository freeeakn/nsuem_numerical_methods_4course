import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Calculator, RefreshCw, History, AlertCircle } from "lucide-react";
import { useIntegrationStore } from "@/store/integrationStore";

export function SimpsonCalculator() {
  const {
    a,
    b,
    n,
    functionString,
    result,
    error,
    isCalculating,
    calculationSteps,
    setParameters,
    calculate,
    reset,
    validateFunction,
  } = useIntegrationStore();

  const [localFunction, setLocalFunction] = useState(functionString);
  const [functionError, setFunctionError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем функцию перед вычислением
    const validation = validateFunction(localFunction);
    if (!validation.isValid) {
      setFunctionError(validation.message || "Некорректная функция");
      return;
    }

    setParameters({ functionString: localFunction });
    calculate();
  };

  const handleFunctionChange = (value: string) => {
    setLocalFunction(value);
    const validation = validateFunction(value);
    setFunctionError(validation.isValid ? null : validation.message || "");
  };

  const handleExampleClick = (example: string) => {
    setLocalFunction(example);
    setFunctionError(null);
  };

  const exampleFunctions = [
    { label: "x²", value: "x^2", description: "Квадрат x" },
    { label: "sin(x)", value: "sin(x)", description: "Синус x" },
    { label: "cos(x)", value: "cos(x)", description: "Косинус x" },
    { label: "e^x", value: "exp(x)", description: "Экспонента" },
    { label: "ln(x)", value: "ln(x)", description: "Натуральный логарифм" },
    { label: "1/x", value: "1/x", description: "Обратная величина" },
    { label: "sqrt(x)", value: "sqrt(x)", description: "Квадратный корень" },
    { label: "50", value: "50", description: "Константа 50" },
  ];

  const functionTips = [
    "Используйте x как переменную",
    "Поддерживаются: +, -, *, /, ^ (степень)",
    "Доступны функции: sin, cos, tan, exp, ln, log, sqrt",
    "Константы: PI (3.14159), E (2.71828)",
    'Примеры: "x^2 + 3*x - 5", "sin(x)*cos(x)", "exp(-x^2)"',
  ];

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Вычисление определенного интеграла методом Симпсона
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - параметры */}
        <Card>
          <CardHeader>
            <CardTitle>Параметры интегрирования</CardTitle>
            <CardDescription>
              Введите пределы интегрирования, количество интервалов и функцию
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="a">Нижний предел (a)</Label>
                  <Input
                    id="a"
                    type="number"
                    step="any"
                    value={a}
                    onChange={(e) =>
                      setParameters({ a: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="b">Верхний предел (b)</Label>
                  <Input
                    id="b"
                    type="number"
                    step="any"
                    value={b}
                    onChange={(e) =>
                      setParameters({ b: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label htmlFor="n">Количество интервалов (n): {n}</Label>
                  <span className="text-sm text-muted-foreground">
                    Должно быть четным
                  </span>
                </div>
                <Slider
                  id="n"
                  min={2}
                  max={100}
                  step={2}
                  value={[n]}
                  onValueChange={(value) => setParameters({ n: value[0] })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>2</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="function">Функция f(x)</Label>
                <div className="relative">
                  <Input
                    id="function"
                    value={localFunction}
                    onChange={(e) => handleFunctionChange(e.target.value)}
                    placeholder="Введите функцию, например: x^2 + 3*x - 5 или просто число 50"
                    className={functionError ? "border-red-500" : ""}
                    required
                  />
                  {functionError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>

                {functionError ? (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {functionError}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Поддерживаются математические выражения и константы
                  </p>
                )}

                {/* Подсказки по функциям */}
                <div className="bg-muted/50 p-3 rounded-md mt-2">
                  <p className="text-sm font-medium mb-1">Доступные функции:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {functionTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-1">
                        <span className="text-muted-foreground">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Примеры функций:</Label>
                <div className="grid grid-cols-4 gap-2">
                  {exampleFunctions.map((func) => (
                    <Button
                      key={func.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(func.value)}
                      className="h-auto py-2 flex flex-col items-center justify-center"
                    >
                      <span className="font-medium">{func.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {func.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isCalculating || !!functionError}
                  className="flex-1"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Вычисляем...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Вычислить интеграл
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setLocalFunction(initialValues.functionString);
                    setFunctionError(null);
                  }}
                >
                  Сбросить
                </Button>
              </div>
            </form>

            {/* Результат */}
            {result !== null && !error && (
              <Card className="mt-6 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Результат вычисления:
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ∫<sub>{a}</sub>
                      <sup>{b}</sup> f(x) dx ≈ {result}
                    </p>
                    <div className="mt-3 text-sm space-y-1">
                      <p>f(x) = {functionString}</p>
                      <p>
                        Интервалов: {n} | Шаг: h = {((b - a) / n).toFixed(4)}
                      </p>
                      <p>
                        Пределы: от {a} до {b}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mt-6 bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        Ошибка вычисления:
                      </p>
                      <p className="text-red-600 dark:text-red-400 mt-1">
                        {error}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Проверьте правильность ввода функции и параметров
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Правая колонка - шаги вычисления */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {result !== null ? "Шаги вычисления" : "Информация о методе"}
            </CardTitle>
            <CardDescription>
              {result !== null
                ? "Детализация метода Симпсона"
                : "Введите параметры для вычисления"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result !== null ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="grid grid-cols-5 gap-2 font-medium text-sm">
                    <div className="text-center">i</div>
                    <div className="text-center">xᵢ</div>
                    <div className="text-center">f(xᵢ)</div>
                    <div className="text-center">Коэф.</div>
                    <div className="text-center">Слагаемое</div>
                  </div>
                </div>

                <div className="max-h-100 overflow-y-auto border rounded-md">
                  {calculationSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-5 gap-2 p-3 border-b ${
                        step.i === 0 || step.i === n
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : step.i % 2 === 0
                          ? "bg-muted/30"
                          : "bg-yellow-50 dark:bg-yellow-900/20"
                      }`}
                    >
                      <div className="text-center font-medium">{step.i}</div>
                      <div className="text-center">{step.x.toFixed(4)}</div>
                      <div className="text-center">{step.fx.toFixed(6)}</div>
                      <div className="text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            step.coefficient === 1
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : step.coefficient === 4
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {step.coefficient}
                        </span>
                      </div>
                      <div className="text-center font-medium">
                        {step.term.toFixed(6)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Введите параметры для вычисления
                  </p>
                  <p className="mt-2">
                    Здесь появятся шаги вычисления метода Симпсона
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">О методе Симпсона:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Численный метод вычисления определённого интеграла
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        2
                      </span>
                      <span>Требует чётного количества интервалов (n)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Точность: O(h⁴) — метод 4-го порядка</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        4
                      </span>
                      <span>
                        Основан на приближении функции квадратичными параболами
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Информация о методе */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Краткая теория</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>Метод Симпсона</strong> (или правило Симпсона) — это
              численный метод приближённого вычисления определённого интеграла с
              использованием квадратичных интерполяционных полиномов.
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-mono text-sm">
                Формула: ∫<sub>a</sub>
                <sup>b</sup> f(x) dx ≈ (h/3) [f(x₀) + 4∑f(x<sub>нечет</sub>) +
                2∑f(x<sub>чет</sub>) + f(xₙ)]
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>Точность: O(h⁴) — метод 4-го порядка</li>
              <li>Требует чётного количества интервалов</li>
              <li>Точнее метода трапеций и прямоугольников</li>
              <li>Основан на приближении функции квадратичными параболами</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Начальные значения для сброса
const initialValues = {
  functionString: "x^2",
  a: 0,
  b: 1,
  n: 4,
};
