import { Formik, Form, FieldArray, Field } from "formik";
import { useEffect, useState } from "react";

function TextEditor({ value, onUpdate, activeQuestionIndex }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);

    const newValue = e.target.value;

    const questionMatch = newValue.match(
      /(?<=\*\*Question\*\*\n)([\s\S]+?)(?=\n\*\*Answers\*\*)/
    );
    const answersMatch = newValue.match(
      /(?<=\*\*Answers\*\*\n)([\s\S]+?)(?=\n\*\*Correct Answer\*\*)/
    );
    const correctAnswerMatch = newValue.match(
      /(?<=\*\*Correct Answer\*\*\n)([A-D])/
    );

    if (questionMatch && answersMatch && correctAnswerMatch) {
      const questionText = questionMatch[1].trim();
      const answers = answersMatch[1]
        .split("\n")
        .map((a) => a.replace(/^[A-Z]\.\s*/, "").trim()) // Remove prefixing letter and dot
        .filter((a) => a); // Filter out empty answers

      const correctAnswer = correctAnswerMatch[1].trim();

      const question = {
        text: questionText,
        answers: answers.map((text) => ({ text })),
        correctAnswer,
      };

      console.log(question);

      onUpdate(question, activeQuestionIndex);
    }
  };

  return (
    <textarea
      className="w-full h-full border rounded p-2"
      value={localValue}
      onChange={handleChange}
    ></textarea>
  );
}

function QuestionEditor({
  questions,
  setActiveQuestionIndex,
  activeQuestionIndex,
}) {
  return (
    <Form>
      <FieldArray name="questions">
        {({ push, remove }) => (
          <div>
            {questions.map((_, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  index === activeQuestionIndex ? "bg-blue-100" : ""
                }`}
                onClick={() => setActiveQuestionIndex(index)}
              >
                <div key={index} className="mb-4">
                  <div className="mb-2">
                    <Field
                      className="w-full p-1 border rounded"
                      name={`questions[${index}].text`}
                      placeholder="Question"
                    />
                  </div>
                  <FieldArray name={`questions[${index}].answers`}>
                    {({ push: pushAnswer, remove: removeAnswer }) => (
                      <div>
                        {_.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center mb-2">
                            <Field
                              className="flex-1 p-1 border rounded mr-2"
                              name={`questions[${index}].answers[${aIndex}].text`}
                              placeholder="Answer"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswer(aIndex)}
                            >
                              X
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mb-2"
                          onClick={() => pushAnswer({ text: "" })}
                        >
                          Add Answer
                        </button>
                      </div>
                    )}
                  </FieldArray>
                  <div className="mb-2">
                    <Field
                      className="w-full p-1 border rounded"
                      name={`questions[${index}].correctAnswer`}
                      placeholder="Correct Answer"
                    />
                  </div>
                  <button type="button" onClick={() => remove(index)}>
                    Remove Question
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                push({
                  text: "",
                  answers: [{ text: "" }],
                  correctAnswer: "",
                });
                setActiveQuestionIndex(questions.length);
              }}
            >
              Add Question
            </button>
          </div>
        )}
      </FieldArray>
    </Form>
  );
}

function JsonEditor({ value, onUpdate }) {
  const handleChange = (e) => {
    const newValue = e.target.value;

    try {
      const parsedData = JSON.parse(newValue);
      onUpdate(parsedData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <textarea
      className="w-full h-full border rounded p-2"
      value={value}
      onChange={handleChange}
    ></textarea>
  );
}

function questionsToMarkdown(questions) {
  return questions
    .map((question) => {
      const answers = question.answers
        .map((a, index) => {
          // Convert 0 to A, 1 to B, 2 to C, etc.
          const ASCII_A = 65;
          const letter = String.fromCharCode(ASCII_A + index);
          return `${letter}. ${a.text}`;
        })
        .join("\n");

      return `**Question**
${question.text}

**Answers**
${answers}

**Correct Answer**
${question.correctAnswer}`;
    })
    .join("\n\n");
}

function questionsToJson(questions) {
  return JSON.stringify(
    {
      name: "React Test",
      duration: 60,
      questions: questions.map((question) => ({
        text: question.text,
        answers: question.answers.map((a) => ({
          text: a.text,
          is_correct: a.text === question.correctAnswer,
        })),
      })),
    },
    null,
    2
  );
}

function App() {
  const [textStr, setTextStr] = useState("");
  const [jsonStr, setJsonStr] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1); // initial value to -1 which means no question is active

  const handleQuestionUpdate = (question, index, setFieldValue) => {
    setFieldValue(`questions[${index}]`, question);
  };

  return (
    <div className="min-h-screen flex">
      <Formik initialValues={{ questions: [] }} onSubmit={() => {}}>
        {({ values, setFieldValue }) => {
          useEffect(() => {
            const question = values.questions[activeQuestionIndex];
            if (question) {
              setTextStr(questionsToMarkdown([question]));
            } else {
              setTextStr("");
            }
            setJsonStr(questionsToJson(values.questions));
          }, [values, activeQuestionIndex]);

          return (
            <div className="flex flex-1">
              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <TextEditor
                  value={textStr}
                  onUpdate={(question, index) =>
                    handleQuestionUpdate(question, index, setFieldValue)
                  }
                  activeQuestionIndex={activeQuestionIndex}
                />
              </div>

              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <QuestionEditor
                  questions={values.questions}
                  setActiveQuestionIndex={setActiveQuestionIndex}
                  activeQuestionIndex={activeQuestionIndex}
                />
              </div>

              <div className="flex-1 p-4 overflow-auto">
                <JsonEditor
                  value={jsonStr}
                  onUpdate={(data) => {
                    setFieldValue("questions", data.questions);
                  }}
                />
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}

export default App;
