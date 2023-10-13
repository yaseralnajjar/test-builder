import { Formik, Form, FieldArray, Field } from "formik";
import { useEffect, useState } from "react";

function App() {
  const [textStr, setTextStr] = useState("");
  const [jsonStr, setJsonStr] = useState("");
  const [jsonParseError, setJsonParseError] = useState("");

  return (
    <div className="min-h-screen flex">
      <Formik initialValues={{ inputGroups: [] }} onSubmit={() => {}}>
        {({ values, setFieldValue, setValues }) => {
          useEffect(() => {
            setJsonStr(JSON.stringify(values.inputGroups, null, 2));
          }, [values]);

          useEffect(() => {
            setTextStr(
              values.inputGroups
                .map(
                  (group) =>
                    `firstInput: ${group.firstInput}, secondInput: ${group.secondInput}`
                )
                .join("\n")
            );
          }, [values]);

          return (
            <div className="flex flex-1">
              {/* Left Part: Text Edit */}
              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <textarea
                  className="w-full h-full border rounded p-2"
                  value={textStr}
                  onChange={(e) => {
                    setTextStr(e.target.value);
                    const lines = e.target.value.trim().split("\n");
                    const inputGroups = lines.map((line) => {
                      const firstInputMatch = line.match(/firstInput: ([^,]+)/);
                      const secondInputMatch = line.match(/secondInput: (.+)/);
                      return {
                        firstInput: firstInputMatch
                          ? firstInputMatch[1].trim()
                          : "",
                        secondInput: secondInputMatch
                          ? secondInputMatch[1].trim()
                          : "",
                      };
                    });
                    setValues({ inputGroups });
                  }}
                ></textarea>
              </div>

              {/* Center Part: Control Inputs */}
              <div className="flex-1 border-r-2 border-gray-400 p-4">
                <Form>
                  <FieldArray name="inputGroups">
                    {({ push, remove, move }) => (
                      <div>
                        {values.inputGroups.map((_, index) => (
                          <div key={index} className="mb-2 flex items-center">
                            <Field
                              className="mr-2 p-1 border rounded"
                              name={`inputGroups[${index}].firstInput`}
                              placeholder="First Input"
                              onChange={(e) => {
                                setFieldValue(
                                  `inputGroups[${index}].firstInput`,
                                  e.target.value
                                );
                              }}
                            />
                            <Field
                              className="mr-2 p-1 border rounded"
                              name={`inputGroups[${index}].secondInput`}
                              placeholder="Second Input"
                              onChange={(e) => {
                                setFieldValue(
                                  `inputGroups[${index}].secondInput`,
                                  e.target.value
                                );
                              }}
                            />
                            {index > 0 ? (
                              <button
                                type="button"
                                className="mr-2 px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded"
                                onClick={() => move(index, index - 1)}
                              >
                                Up
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="mr-2 px-2 py-1 bg-gray-300 text-white rounded"
                                disabled
                              >
                                Up
                              </button>
                            )}
                            {index < values.inputGroups.length - 1 ? (
                              <button
                                type="button"
                                className="mr-2 px-2 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded"
                                onClick={() => move(index, index + 1)}
                              >
                                Down
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="mr-2 px-2 py-1 bg-gray-300 text-white rounded"
                                disabled
                              >
                                Down
                              </button>
                            )}
                            <button
                              type="button"
                              className="mr-2 px-2 py-1 hover:bg-red-500 bg-red-300 text-white hover:text-white rounded"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mr-2 px-4 py-1 bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent rounded "
                          onClick={() =>
                            push({ firstInput: "", secondInput: "" })
                          }
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </Form>
              </div>

              {/* Right Part: JSON Display */}
              <div className="flex-1 p-4 overflow-auto">
                {jsonParseError && (
                  <p className="text-red-500">{jsonParseError}</p>
                )}
                <textarea
                  className="w-full h-full border rounded p-2"
                  value={jsonStr}
                  onChange={(e) => {
                    setJsonStr(e.target.value);
                    try {
                      const parsedJson = JSON.parse(e.target.value);
                      if (Array.isArray(parsedJson)) {
                        setJsonParseError("");
                        setValues({ inputGroups: parsedJson });
                      } else {
                        setJsonParseError("The parsed JSON is not an array.");
                      }
                    } catch (err) {
                      console.error(err);
                      setJsonParseError("Invalid JSON format.");
                    }
                  }}
                ></textarea>
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}

export default App;
