const cap = (s) =>
  s ? `${s[0].toUpperCase()}${s.slice(1)}` : '';

export default function Group({
  legend,
  options,
  value,
  onChange,
  multi,
  max,
}) {
  const arr = multi ? value || [] : [];

  function select(option) {
    if (multi) {
      const selected = arr.includes(option);

      if (selected) {
        onChange(arr.filter((item) => item !== option));
        return;
      }

      if (arr.length >= (max ?? 99)) {
        return;
      }

      onChange([...arr, option]);
      return;
    }

    onChange(value === option ? undefined : option);
  }

  return (
    <fieldset className="field">
      <legend>{legend}</legend>

      <div className="chips">
        {options.map((option) => {
          const selected = multi
            ? arr.includes(option)
            : value === option;

          const limitReached =
            multi &&
            !selected &&
            arr.length >= (max ?? 99);

          return (
            <button
              type="button"
              key={option}
              className={`chip ${selected ? 'selected' : ''}`}
              aria-pressed={selected}
              aria-disabled={limitReached}
              onClick={() => select(option)}
            >
              {cap(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}