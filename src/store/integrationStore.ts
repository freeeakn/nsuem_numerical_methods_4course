import { create } from "zustand";

interface IntegrationStore {
  a: number;
  b: number;
  n: number;
  functionString: string;
  result: number | null;
  error: string | null;
  isCalculating: boolean;
  calculationSteps: Array<{
    i: number;
    x: number;
    fx: number;
    coefficient: number;
    term: number;
  }>;

  setParameters: (params: {
    a?: number;
    b?: number;
    n?: number;
    functionString?: string;
  }) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  validateFunction: (funcString: string) => {
    isValid: boolean;
    message?: string;
  };
}

const initialValues = {
  a: 0,
  b: 1,
  n: 4,
  functionString: "x^2",
  result: null,
  error: null,
  isCalculating: false,
  calculationSteps: [],
};

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  ...initialValues,

  setParameters: (params) => {
    set((state) => ({
      ...state,
      ...params,
      error: null,
    }));
  },

  validateFunction: (funcString: string) => {
    // Проверяем, является ли ввод простым числом
    const numValue = parseFloat(funcString);
    if (!isNaN(numValue)) {
      return {
        isValid: true,
        message: `Константная функция: f(x) = ${numValue}`,
      };
    }

    // Проверяем, является ли ввод простой математической функцией
    try {
      // Подготавливаем строку для проверки
      let testString = funcString.trim();

      // Заменяем математические операторы и функции
      testString = testString
        .replace(/\^/g, "**") // Заменяем ^ на **
        .replace(/sin\(/gi, "Math.sin(")
        .replace(/cos\(/gi, "Math.cos(")
        .replace(/tan\(/gi, "Math.tan(")
        .replace(/exp\(/gi, "Math.exp(")
        .replace(/ln\(/gi, "Math.log(")
        .replace(/log\(/gi, "Math.log10(")
        .replace(/sqrt\(/gi, "Math.sqrt(")
        .replace(/pow\(/gi, "Math.pow")
        .replace(/\bPI\b/gi, "Math.PI")
        .replace(/\bE\b/gi, "Math.E");

      // Проверяем наличие недопустимых символов
      const allowedRegex =
        /^[0-9x+\-*/^()., \t\n\rMathsincoetanexplogsqrtPI()]*$/gi;
      if (!allowedRegex.test(testString)) {
        return { isValid: false, message: "Содержит недопустимые символы" };
      }

      // Пробуем создать функцию
      const testFunc = new Function(
        "x",
        `try { return ${testString}; } catch { return NaN; }`
      );
      const testResult = testFunc(1);

      if (isNaN(testResult)) {
        return { isValid: false, message: "Функция возвращает NaN при x=1" };
      }

      return { isValid: true };
    } catch (err) {
      return { isValid: false, message: "Некорректный синтаксис функции" };
    }
  },

  calculate: async () => {
    const { a, b, n, functionString, validateFunction } = get();

    // Валидация параметров
    if (n % 2 !== 0) {
      set({ error: "Количество интервалов n должно быть четным числом" });
      return;
    }

    if (b <= a) {
      set({ error: "Верхний предел должен быть больше нижнего" });
      return;
    }

    if (n < 2) {
      set({ error: "Количество интервалов должно быть не менее 2" });
      return;
    }

    // Валидация функции
    const validation = validateFunction(functionString);
    if (!validation.isValid) {
      set({
        error: validation.message || "Некорректная функция",
        result: null,
        isCalculating: false,
      });
      return;
    }

    set({ isCalculating: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const steps = [];
      let result = 0;
      const h = (b - a) / n;

      // Функция для вычисления f(x)
      const f = (x: number): number => {
        try {
          // Преобразуем пользовательский ввод в валидный JS
          let processedFunc = functionString.trim();

          // Если это просто число
          const numValue = parseFloat(processedFunc);
          if (!isNaN(numValue)) {
            return numValue;
          }

          // Заменяем математические обозначения
          processedFunc = processedFunc
            .replace(/\^/g, "**") // x^2 -> x**2
            .replace(/sin\(/gi, "Math.sin(")
            .replace(/cos\(/gi, "Math.cos(")
            .replace(/tan\(/gi, "Math.tan(")
            .replace(/exp\(/gi, "Math.exp(")
            .replace(/ln\(/gi, "Math.log(")
            .replace(/log\(/gi, "Math.log10(")
            .replace(/sqrt\(/gi, "Math.sqrt(")
            .replace(/pow\(/gi, "Math.pow")
            .replace(/\bPI\b/gi, "Math.PI")
            .replace(/\bE\b/gi, "Math.E")
            .replace(/x\s*\*\s*\*/g, "x**"); // Убираем пробелы вокруг **

          // Удаляем лишние пробелы
          processedFunc = processedFunc.replace(/\s+/g, " ");

          // Проверяем на наличие x в выражении
          if (!processedFunc.includes("x")) {
            // Если нет x, это константа
            const constantValue = eval(processedFunc);
            return typeof constantValue === "number"
              ? constantValue
              : Number(processedFunc);
          }

          // Создаем функцию для вычисления
          const func = new Function(
            "x",
            `
            try {
              with(Math) {
                return ${processedFunc};
              }
            } catch(e) {
              return NaN;
            }
          `
          );

          const value = func(x);

          if (isNaN(value) || !isFinite(value)) {
            throw new Error(`Некорректное значение при x = ${x}`);
          }

          return value;
        } catch (err) {
          throw new Error(
            `Ошибка вычисления: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      };

      // Вычисление по методу Симпсона
      for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        let fx: number;
        let coefficient: number;

        try {
          fx = f(x);

          if (i === 0 || i === n) {
            coefficient = 1;
          } else if (i % 2 === 0) {
            coefficient = 2;
          } else {
            coefficient = 4;
          }

          const term = coefficient * fx;
          result += term;

          steps.push({
            i,
            x: parseFloat(x.toFixed(4)),
            fx: parseFloat(fx.toFixed(6)),
            coefficient,
            term: parseFloat(term.toFixed(6)),
          });
        } catch (err) {
          throw new Error(
            `Ошибка при x = ${x.toFixed(4)}: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }

      result = (h / 3) * result;

      set({
        result: parseFloat(result.toFixed(6)),
        calculationSteps: steps,
        isCalculating: false,
        error: null,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Произошла неизвестная ошибка",
        isCalculating: false,
        result: null,
      });
    }
  },

  reset: () => {
    set(initialValues);
  },
}));
