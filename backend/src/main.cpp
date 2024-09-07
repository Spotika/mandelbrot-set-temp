#include <iostream>
#include <httplib.h>
#include <json.h>

#define JSON_RESPONSE(json) res.set_content(json.dump(), "application/json")

using json = nlohmann::json;

int counter = 0;

struct Point {
    double x;
    double y;
};


std::vector<Point> generateKochCurve(int k) {
    std::vector<Point> curve = { {-0.9, -0.6}, {0.9, -0.6} };

    auto angle = - M_PI / 3;

    for (int i = 0; i < k; i++) {
        std::vector<Point> newCurve;
        for (size_t j = 0; j < curve.size() - 1; j++) {
            Point p1 = curve[j];
            Point p2 = curve[j + 1];

            Point s = { (2 * p1.x + p2.x) / 3, (2 * p1.y + p2.y) / 3 };
            Point t = { (p1.x + 2 * p2.x) / 3, (p1.y + 2 * p2.y) / 3 };

            double dx = t.x - s.x;
            double dy = t.y - s.y;
            Point peak = { s.x + dx * cos(angle) - dy * sin(angle),
                           s.y + dx * sin(angle) + dy * cos(angle) };

            newCurve.push_back(p1);
            newCurve.push_back(s);
            newCurve.push_back(peak);
            newCurve.push_back(t);
        }
        newCurve.push_back(curve.back());
        curve = newCurve;
    }
    return curve;
}

std::vector<float> flat(const std::vector<Point> &vector) {
  std::vector<float> result;
  for (const Point& point : vector) {
    result.push_back(point.x);
    result.push_back(-point.y - 0.9f);
  }

  return result;
}


int main() {
  httplib::Server app;

  app.set_post_routing_handler([](const auto& req, auto& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Headers", "*");
  });

  app.Get("/ping", [](const auto& req, auto& res) {
    json response = {
      {"ok", true}
    };

    JSON_RESPONSE(response);
  });

  app.Get("/curve", [](const auto& req, auto& res) {
    std::string iterations = req.get_param_value("iterations");

    int iters = std::stoi(iterations);

    json response = {
      {"ok", true},
      {"points", flat(generateKochCurve(iters))}
    };

    JSON_RESPONSE(response);
  });

  app.listen("0.0.0.0", 8080);

  return 0;
}
