import { Formik, Form, FieldArray, Field } from "formik";

function App() {
  return (
    <div className="min-h-screen flex">
      <Formik initialValues={{ inputGroups: [] }} onSubmit={() => {}}>
        {({ values, setFieldValue }) => (
          <div className="flex flex-1">
            {/* Left Part */}
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
            {/* Right Part */}
            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-xs">
                {JSON.stringify(values.inputGroups, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
}

export default App;
