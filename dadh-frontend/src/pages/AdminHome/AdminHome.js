import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody
} from "reactstrap";
import { Link } from "react-router-dom";

// import images
import servicesIcon1 from "../../assets/images/services-icon/01.png";
import servicesIcon2 from "../../assets/images/services-icon/02.png";
import servicesIcon3 from "../../assets/images/services-icon/03.png";
import servicesIcon4 from "../../assets/images/services-icon/04.png";

const AdminHome = () => {
  document.title = "AdminHome";

  return (
    <div className="page-content">
      <Container fluid>
        <div className="page-title-box">
          <Row className="align-items-center">
            <Col md={8}>
              <h6 className="page-title">Admin Home</h6>
            
            </Col>
          </Row>
        </div>

        {/* Only Showing Top 4 Cards */}
        <Row>
          {[
            {
              title: "Orders",
              value: "1,685",
              icon: servicesIcon1,
              badge: "+ 12%",
              badgeColor: "success",
              arrow: "up"
            },
            {
              title: "Revenue",
              value: "52,368",
              icon: servicesIcon2,
              badge: "- 28%",
              badgeColor: "danger",
              arrow: "down"
            },
            {
              title: "Average Price",
              value: "15.8",
              icon: servicesIcon3,
              badge: "00%",
              badgeColor: "info",
              arrow: "up"
            },
            {
              title: "Product Sold",
              value: "2436",
              icon: servicesIcon4,
              badge: "+ 84%",
              badgeColor: "warning",
              arrow: "up"
            },
          ].map((card, idx) => (
            <Col xl={3} md={6} key={idx}>
              <Card className="mini-stat bg-primary text-white">
                <CardBody>
                  <div className="mb-4">
                    <div className="float-start mini-stat-img me-4">
                      <img src={card.icon} alt="" />
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">{card.title}</h5>
                    <h4 className="fw-medium font-size-24">
                      {card.value}
                      <i className={`mdi mdi-arrow-${card.arrow} text-${card.badgeColor} ms-2`}></i>
                    </h4>
                    <div className={`mini-stat-label bg-${card.badgeColor}`}>
                      <p className="mb-0">{card.badge}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="float-end">
                      <Link to="#" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Since last month</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AdminHome;
