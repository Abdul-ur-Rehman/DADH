import React from "react"
import { Container, Row, Col } from "reactstrap"

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer" style={{ padding: "16px 0", textAlign: "center", color: "#64748b", fontSize: "13px", borderTop: "1px solid #e2e8f0" }}>
        <Container fluid={true}>
          <Row>
            <div className="col-12">
              © {new Date().getFullYear()} Dial A Home Doctor - Australian Telemedicine Platform
            </div>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  )
}

export default Footer
