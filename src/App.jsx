import { Formik, Form, FieldArray, Field } from "formik";
import { useEffect, useState } from "react";

function TextEditor({ value, onUpdate }) {
  const handleChange = (e) => {
    const newValue = e.target.value;
    const questions = [];

    const sections = newValue
      .split(/(?=---\s*(?:---)?)/) // This splits using --- or ---\n---
      .map((s) => s.trim())
      .filter(Boolean); // Filter out empty strings

    sections.forEach((section) => {
      const questionMatch = section.match(
        /### \*\*Question:\*\*\s*\n([\s\S]+?)\n### \*\*Answers:\*\*/
      );
      const answersMatch = section.match(
        /### \*\*Answers:\*\*\s*\n([\s\S]+?)\n### \*\*Correct Answer:\*\*/
      );
      const correctAnswerMatch = section.match(
        /### \*\*Correct Answer:\*\*\s*\n([A-D])\./
      );

      if (questionMatch && answersMatch && correctAnswerMatch) {
        questions.push({
          text: questionMatch[1].trim(),
          answers: answersMatch[1]
            .split(/\n[A-D]\./) // Split answers by newline followed by letter and dot
            .map((a) => ({ text: a.trim() }))
            .filter((a) => a.text), // Filter out empty answers
          correctAnswer: correctAnswerMatch[1].trim(),
        });
      }
    });

    onUpdate(questions);
  };

  return (
    <textarea
      className="w-full h-full border rounded p-2"
      value={value}
      onChange={handleChange}
    ></textarea>
  );
}

function QuestionEditor({ questions }) {
  return (
    <Form>
      <FieldArray name="questions">
        {({ push, remove }) => (
          <div>
            {questions.map((_, index) => (
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
            ))}
            <button
              type="button"
              onClick={() =>
                push({
                  text: "",
                  answers: [{ text: "" }],
                  correctAnswer: "",
                })
              }
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
    .map(
      (question) => `**Question**
${question.text}

**Answers**
${question.answers.map((a) => a.text).join("\n")}

**Correct Answer**
${question.correctAnswer}
---`
    )
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

  return (
    <div className="min-h-screen flex">
      <Formik initialValues={{ questions: [] }} onSubmit={() => {}}>
        {({ values, setValues }) => {
          useEffect(() => {
            setTextStr(questionsToMarkdown(values.questions));
            setJsonStr(questionsToJson(values.questions));
          }, [values]);

          return (
            <div className="flex flex-1">
              {/* Left Part: Text Edit */}
              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <TextEditor
                  value={textStr}
                  onUpdate={(questions) => setValues({ questions })}
                />
              </div>

              {/* Center Part: Control Inputs */}
              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <QuestionEditor questions={values.questions} />
              </div>

              {/* Right Part: JSON Display */}
              <div className="flex-1 p-4 overflow-auto">
                <JsonEditor
                  value={jsonStr}
                  onUpdate={(data) => {
                    setValues({ questions: data.questions });
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
