# Run the Bayesian Causal Forest (BCF) algorithm for regularized causal effect estimation.

## Description

Run the Bayesian Causal Forest (BCF) algorithm for regularized causal effect estimation.

## Usage

```r
bcf(
  X_train,
  Z_train,
  y_train,
  pi_train = NULL,
  group_ids_train = NULL,
  rfx_basis_train = NULL,
  X_test = NULL,
  Z_test = NULL,
  pi_test = NULL,
  group_ids_test = NULL,
  rfx_basis_test = NULL,
  num_gfr = 5,
  num_burnin = 0,
  num_mcmc = 100,
  params = list()
)
```

## Arguments

* `X_train`: Covariates used to split trees in the ensemble. May be provided either as a dataframe or a matrix.
Matrix covariates will be assumed to be all numeric. Covariates passed as a dataframe will be
preprocessed based on the variable types (e.g. categorical columns stored as unordered factors will be one-hot encoded,
categorical columns stored as ordered factors will passed as integers to the core algorithm, along with the metadata
that the column is ordered categorical).
* `Z_train`: Vector of (continuous or binary) treatment assignments.
* `y_train`: Outcome to be modeled by the ensemble.
* `pi_train`: (Optional) Vector of propensity scores. If not provided, this will be estimated from the data.
* `group_ids_train`: (Optional) Group labels used for an additive random effects model.
* `rfx_basis_train`: (Optional) Basis for "random-slope" regression in an additive random effects model.
If `group_ids_train` is provided with a regression basis, an intercept-only random effects model
will be estimated.
* `X_test`: (Optional) Test set of covariates used to define "out of sample" evaluation data.
May be provided either as a dataframe or a matrix, but the format of `X_test` must be consistent with
that of `X_train`.
* `Z_test`: (Optional) Test set of (continuous or binary) treatment assignments.
* `pi_test`: (Optional) Vector of propensity scores. If not provided, this will be estimated from the data.
* `group_ids_test`: (Optional) Test set group labels used for an additive random effects model.
We do not currently support (but plan to in the near future), test set evaluation for group labels
that were not in the training set.
* `rfx_basis_test`: (Optional) Test set basis for "random-slope" regression in additive random effects model.
* `num_gfr`: Number of "warm-start" iterations run using the grow-from-root algorithm (He and Hahn, 2021). Default: 5.
* `num_burnin`: Number of "burn-in" iterations of the MCMC sampler. Default: 0.
* `num_mcmc`: Number of "retained" iterations of the MCMC sampler. Default: 100.
* `params`: The list of model parameters, each of which has a default value.***1. Global Parameters***
* `cutpoint_grid_size` Maximum size of the "grid" of potential cutpoints to consider. Default: `100`.
* `a_global` Shape parameter in the `IG(a_global, b_global)` global error variance model. Default: `0`.
* `b_global` Scale parameter in the `IG(a_global, b_global)` global error variance model. Default: `0`.
* `sigma2_init` Starting value of global error variance parameter. Calibrated internally as `pct_var_sigma2_init*var((y-mean(y))/sd(y))` if not set.
* `pct_var_sigma2_init` Percentage of standardized outcome variance used to initialize global error variance parameter. Default: `1`. Superseded by `sigma2_init`.
* `variable_weights` Numeric weights reflecting the relative probability of splitting on each variable. Does not need to sum to 1 but cannot be negative. Defaults to `rep(1/ncol(X_train), ncol(X_train))` if not set here. Note that if the propensity score is included as a covariate in either forest, its weight will default to `1/ncol(X_train)`. A workaround if you wish to provide a custom weight for the propensity score is to include it as a column in `X_train` and then set `propensity_covariate` to `'none'` adjust `keep_vars_mu`, `keep_vars_tau` and `keep_vars_variance` accordingly.
* `propensity_covariate` Whether to include the propensity score as a covariate in either or both of the forests. Enter `"none"` for neither, `"mu"` for the prognostic forest, `"tau"` for the treatment forest, and `"both"` for both forests. If this is not `"none"` and a propensity score is not provided, it will be estimated from (`X_train`, `Z_train`) using `stochtree::bart()`. Default: `"mu"`.
* `adaptive_coding` Whether or not to use an "adaptive coding" scheme in which a binary treatment variable is not coded manually as (0,1) or (-1,1) but learned via parameters `b_0` and `b_1` that attach to the outcome model `[b_0 (1-Z) + b_1 Z] tau(X)`. This is ignored when Z is not binary. Default: `TRUE`.
* `b_0` Initial value of the "control" group coding parameter. This is ignored when Z is not binary. Default: `-0.5`.
* `b_1` Initial value of the "treatment" group coding parameter. This is ignored when Z is not binary. Default: `0.5`.
* `random_seed` Integer parameterizing the C++ random number generator. If not specified, the C++ random number generator is seeded according to `std::random_device`.
* `keep_burnin` Whether or not "burnin" samples should be included in cached predictions. Default `FALSE`. Ignored if `num_mcmc = 0`.
* `keep_gfr` Whether or not "grow-from-root" samples should be included in cached predictions. Default `FALSE`. Ignored if `num_mcmc = 0`.
* `verbose` Whether or not to print progress during the sampling loops. Default: `FALSE`.
* `sample_sigma_global` Whether or not to update the `sigma^2` global error variance parameter based on `IG(a_global, b_global)`. Default: `TRUE`.***2. Prognostic Forest Parameters***
* `num_trees_mu` Number of trees in the prognostic forest. Default: `200`.
* `sample_sigma_leaf_mu` Whether or not to update the `sigma_leaf_mu` leaf scale variance parameter in the prognostic forest based on `IG(a_leaf_mu, b_leaf_mu)`. Default: `TRUE`.***2.1. Tree Prior Parameters***
* `alpha_mu` Prior probability of splitting for a tree of depth 0 for the prognostic forest. Tree split prior combines `alpha` and `beta` via `alpha_mu*(1+node_depth)^-beta_mu`. Default: `0.95`.
* `beta_mu` Exponent that decreases split probabilities for nodes of depth > 0 for the prognostic forest. Tree split prior combines `alpha` and `beta` via `alpha_mu*(1+node_depth)^-beta_mu`. Default: `2.0`.
* `min_samples_leaf_mu` Minimum allowable size of a leaf, in terms of training samples, for the prognostic forest. Default: `5`.
* `max_depth_mu` Maximum depth of any tree in the mu ensemble. Default: `10`. Can be overridden with `-1` which does not enforce any depth limits on trees.***2.2. Leaf Model Parameters***
* `keep_vars_mu` Vector of variable names or column indices denoting variables that should be included in the prognostic (`mu(X)`) forest. Default: `NULL`.
* `drop_vars_mu` Vector of variable names or column indices denoting variables that should be excluded from the prognostic (`mu(X)`) forest. Default: `NULL`. If both `drop_vars_mu` and `keep_vars_mu` are set, `drop_vars_mu` will be ignored.
* `sigma_leaf_mu` Starting value of leaf node scale parameter for the prognostic forest. Calibrated internally as `1/num_trees_mu` if not set here.
* `a_leaf_mu` Shape parameter in the `IG(a_leaf_mu, b_leaf_mu)` leaf node parameter variance model for the prognostic forest. Default: `3`.
* `b_leaf_mu` Scale parameter in the `IG(a_leaf_mu, b_leaf_mu)` leaf node parameter variance model for the prognostic forest. Calibrated internally as `0.5/num_trees` if not set here.***3. Treatment Effect Forest Parameters***
* `num_trees_tau` Number of trees in the treatment effect forest. Default: `50`.
* `sample_sigma_leaf_tau` Whether or not to update the `sigma_leaf_tau` leaf scale variance parameter in the treatment effect forest based on `IG(a_leaf_tau, b_leaf_tau)`. Default: `TRUE`.***3.1. Tree Prior Parameters***
* `alpha_tau` Prior probability of splitting for a tree of depth 0 for the treatment effect forest. Tree split prior combines `alpha` and `beta` via `alpha_tau*(1+node_depth)^-beta_tau`. Default: `0.25`.
* `beta_tau` Exponent that decreases split probabilities for nodes of depth > 0 for the treatment effect forest. Tree split prior combines `alpha` and `beta` via `alpha_tau*(1+node_depth)^-beta_tau`. Default: `3.0`.
* `min_samples_leaf_tau` Minimum allowable size of a leaf, in terms of training samples, for the treatment effect forest. Default: `5`.
* `max_depth_tau` Maximum depth of any tree in the tau ensemble. Default: `5`. Can be overridden with `-1` which does not enforce any depth limits on trees.***3.2. Leaf Model Parameters***
* `a_leaf_tau` Shape parameter in the `IG(a_leaf, b_leaf)` leaf node parameter variance model for the treatment effect forest. Default: `3`.
* `b_leaf_tau` Scale parameter in the `IG(a_leaf, b_leaf)` leaf node parameter variance model for the treatment effect forest. Calibrated internally as `0.5/num_trees` if not set here.
* `keep_vars_tau` Vector of variable names or column indices denoting variables that should be included in the treatment effect (`tau(X)`) forest. Default: `NULL`.
* `drop_vars_tau` Vector of variable names or column indices denoting variables that should be excluded from the treatment effect (`tau(X)`) forest. Default: `NULL`. If both `drop_vars_tau` and `keep_vars_tau` are set, `drop_vars_tau` will be ignored.***4. Conditional Variance Forest Parameters***
* `num_trees_variance` Number of trees in the (optional) conditional variance forest model. Default: `0`.
* `variance_forest_init` Starting value of root forest prediction in conditional (heteroskedastic) error variance model. Calibrated internally as `log(pct_var_variance_forest_init*var((y-mean(y))/sd(y)))/num_trees_variance` if not set.
* `pct_var_variance_forest_init` Percentage of standardized outcome variance used to initialize global error variance parameter. Default: `1`. Superseded by `variance_forest_init`.***4.1. Tree Prior Parameters***
* `alpha_variance` Prior probability of splitting for a tree of depth 0 in the (optional) conditional variance model. Tree split prior combines `alpha_variance` and `beta_variance` via `alpha_variance*(1+node_depth)^-beta_variance`. Default: `0.95`.
* `beta_variance` Exponent that decreases split probabilities for nodes of depth > 0 in the (optional) conditional variance model. Tree split prior combines `alpha_variance` and `beta_variance` via `alpha_variance*(1+node_depth)^-beta_variance`. Default: `2.0`.
* `min_samples_leaf_variance` Minimum allowable size of a leaf, in terms of training samples, in the (optional) conditional variance model. Default: `5`.
* `max_depth_variance` Maximum depth of any tree in the ensemble in the (optional) conditional variance model. Default: `10`. Can be overridden with `-1` which does not enforce any depth limits on trees.***4.2. Leaf Model Parameters***
* `a_forest` Shape parameter in the `IG(a_forest, b_forest)` conditional error variance model (which is only sampled if `num_trees_variance > 0`). Calibrated internally as `num_trees_variance / 1.5^2 + 0.5` if not set.
* `b_forest` Scale parameter in the `IG(a_forest, b_forest)` conditional error variance model (which is only sampled if `num_trees_variance > 0`). Calibrated internally as `num_trees_variance / 1.5^2` if not set.
* `keep_vars_variance` Vector of variable names or column indices denoting variables that should be included in the (optional) conditional variance forest. Default: `NULL`.
* `drop_vars_variance` Vector of variable names or column indices denoting variables that should be excluded from the (optional) conditional variance forest. Default: NULL. If both `drop_vars_variance` and `keep_vars_variance` are set, `drop_vars_variance` will be ignored.***5. Random Effects Parameters***
* `rfx_prior_var` Prior on the (diagonals of the) covariance of the additive group-level random regression coefficients. Must be a vector of length `ncol(rfx_basis_train)`. Default: `rep(1, ncol(rfx_basis_train))`

## Value

List of sampling outputs and a wrapper around the sampled forests (which can be used for in-memory prediction on new data, or serialized to JSON on disk).

## Examples

```r
n <- 500
x1 <- rnorm(n)
x2 <- rnorm(n)
x3 <- rnorm(n)
x4 <- as.numeric(rbinom(n,1,0.5))
x5 <- as.numeric(sample(1:3,n,replace=TRUE))
X <- cbind(x1,x2,x3,x4,x5)
p <- ncol(X)
g <- function(x) {ifelse(x[,5]==1,2,ifelse(x[,5]==2,-1,4))}
mu1 <- function(x) {1+g(x)+x[,1]*x[,3]}
mu2 <- function(x) {1+g(x)+6*abs(x[,3]-1)}
tau1 <- function(x) {rep(3,nrow(x))}
tau2 <- function(x) {1+2*x[,2]*x[,4]}
mu_x <- mu1(X)
tau_x <- tau2(X)
pi_x <- 0.8*pnorm((3*mu_x/sd(mu_x)) - 0.5*X[,1]) + 0.05 + runif(n)/10
Z <- rbinom(n,1,pi_x)
E_XZ <- mu_x + Z*tau_x
snr <- 4
y <- E_XZ + rnorm(n, 0, 1)*(sd(E_XZ)/snr)
X <- as.data.frame(X)
X$x4 <- factor(X$x4, ordered = TRUE)
X$x5 <- factor(X$x5, ordered = TRUE)
test_set_pct <- 0.2
n_test <- round(test_set_pct*n)
n_train <- n - n_test
test_inds <- sort(sample(1:n, n_test, replace = FALSE))
train_inds <- (1:n)[!((1:n) %in% test_inds)]
X_test <- X[test_inds,]
X_train <- X[train_inds,]
pi_test <- pi_x[test_inds]
pi_train <- pi_x[train_inds]
Z_test <- Z[test_inds]
Z_train <- Z[train_inds]
y_test <- y[test_inds]
y_train <- y[train_inds]
mu_test <- mu_x[test_inds]
mu_train <- mu_x[train_inds]
tau_test <- tau_x[test_inds]
tau_train <- tau_x[train_inds]
bcf_model <- bcf(X_train = X_train, Z_train = Z_train, y_train = y_train, pi_train = pi_train, 
                 X_test = X_test, Z_test = Z_test, pi_test = pi_test)
# plot(rowMeans(bcf_model$mu_hat_test), mu_test, xlab = "predicted", ylab = "actual", main = "Prognostic function")
# abline(0,1,col="red",lty=3,lwd=3)
# plot(rowMeans(bcf_model$tau_hat_test), tau_test, xlab = "predicted", ylab = "actual", main = "Treatment effect")
# abline(0,1,col="red",lty=3,lwd=3)
```
