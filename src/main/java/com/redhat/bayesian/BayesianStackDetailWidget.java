package com.redhat.bayesian;

import org.sonar.api.web.AbstractRubyTemplate;
import org.sonar.api.web.Description;
import org.sonar.api.web.RubyRailsWidget;
import org.sonar.api.web.UserRole;
import org.sonar.api.web.WidgetCategory;
import org.sonar.api.web.WidgetScope;

/**
 * IDE Metadata plugin widget definition.
 *
 * @author tomas.hrcka
 * @version 1.0
 */
@UserRole(UserRole.USER)
@Description("Shows data about selected component sources.")
@WidgetCategory("Bayesian")
@WidgetScope({
        "PROJECT"
})
public class BayesianStackDetailWidget
    extends AbstractRubyTemplate
    implements RubyRailsWidget {

    /**
     * Default constructor.
     */
    public BayesianStackDetailWidget() {
        super();
    }

    /**
     * Returns the widget id.
     *
     * @return the widget id
     */
    public String getId() {
        return "bayesianStackDetailwidget";
    }

    /**
     * Returns the widget title.
     *
     * @return the widget title
     */
    public String getTitle() {
        return "Bayesian Stack Detail Widget";
    }

    /**
     * Returns the path to the widget Ruby file.
     *
     * @return the path to the widget Ruby file
     */
    @Override
    protected String getTemplatePath() { return "/templates/stack_detail.html.erb"; }
}
