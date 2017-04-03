package com.redhat.bayesian;

import org.sonar.api.web.AbstractRubyTemplate;
import org.sonar.api.web.Description;
import org.sonar.api.web.RubyRailsWidget;
import org.sonar.api.web.UserRole;
import org.sonar.api.web.WidgetCategory;
import org.sonar.api.web.WidgetScope;

public class BayesianCompareReferenceStacksWidget
    extends AbstractRubyTemplate
    implements RubyRailsWidget {

    /**
     * Default constructor.
     */
    public BayesianCompareReferenceStacksWidget() {
        super();
    }

    /**
     * Returns the widget id.
     *
     * @return the widget id
     */
    public String getId() {
        return "bayesianCompareReferenceStackswidget";
    }

    /**
     * Returns the widget title.
     *
     * @return the widget title
     */
    public String getTitle() {
        return "Bayesian Compare Reference Stacks Widget";
    }

    /**
     * Returns the path to the widget Ruby file.
     *
     * @return the path to the widget Ruby file
     */
    @Override
    protected String getTemplatePath() { return "/templates/compare_reference_stacks.html.erb"; }
}
