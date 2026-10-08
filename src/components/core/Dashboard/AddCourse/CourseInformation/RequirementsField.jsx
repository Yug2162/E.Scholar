import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setValue(name, requirementsList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirementsList])

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementsList([...requirementsList, requirement])
      setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-medium text-[#94a3b8]" htmlFor={name}>
        {label} <sup className="text-[#06b6d4]">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-[#06b6d4] hover:text-[#0891b2] transition-colors duration-150"
        >
          Add
        </button>
      </div>
      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((requirement, index) => (
            <li key={index} className="flex items-center text-[#94a3b8]">
              <span>{requirement}</span>
              <button
                type="button"
                className="ml-2 text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors duration-150"
                onClick={() => handleRemoveRequirement(index)}
              >
                clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
          {label} is required
        </span>
      )}
    </div>
  )
}