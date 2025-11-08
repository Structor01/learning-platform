const TestSelector = ({ tests, selectedTestId, onTestSelection, loading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <label htmlFor="data_teste" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a data do teste
          </label>
          <select
            id="data_teste"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedTestId || ''}
            onChange={(e) => onTestSelection(e.target.value)}
            disabled={!tests.length || loading}
          >
            <option value="">Selecione a data do teste</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {new Date(test.createdAt).toLocaleDateString('pt-BR')} - {test.testName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TestSelector;