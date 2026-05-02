jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true })

jest.mock("store/auth", () => ({
  useAuth: () => ({ storeDataInLS: jest.fn() }),
}), { virtual: true })

import DoctorLogin from "./DoctorLogin"

describe("DoctorLogin", () => {
  it("exports the login component", () => {
    expect(DoctorLogin).toBeDefined()
  })
})
